from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
import simplejson as json
import json
import csv
import sys

app = Flask(__name__)

@app.route("/")
def home():
    return "hi"


@app.route('/hello')
def hello():
    return 'hello world'

@app.route('/user/<username>')
def show_user_profile(username):
    return 'User %s' %username

@app.route('/pythonpreprocess', methods=['get','POST'])
def pythonpreprocess():
   message = None
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        result = clean(datafromjs)
        #resp = make_response('{"response": '+result+'}')
        #resp.headers['Content-Type'] = "application/json"
        #return resp
        return json.dumps({'status':'OK','result':result});

@app.route('/match',methods = ['POST'])
def match():
    #markedRTreeData = open('markedRTree.csv','w')
    matchcount = 0
    if request.method == 'POST':

        datafromjs = request.form['mydata']
        #print(type(datafromjs),len(datafromjs),file=sys.stderr)

        #jsonstr = json.dumps(datafromjs)
        #print(type(jsonstr),len(jsonstr),file=sys.stderr)

        jsonobj = json.loads(datafromjs)
        #print(jsonobj, file=sys.stderr)
        #print("\n doc length:\n ", len(jsonobj),type(jsonobj),file=sys.stderr)
        with open('static/RTreeData.csv') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        rmwordcount = len(rows)
        doclen = len( jsonobj['result'][0] )
        for key in range(0, doclen):
            docword = jsonobj['result'][0][key]
            for key2 in range(0, rmwordcount):
                rmword = rows[key2]['id']
                if docword in rmword:
                    print(docword)
                    print(rmword)
                    print("\n")
                    rows[key2]['value'] = 'red'
                    matchcount +=1
                #else:
                    #print("not in")
                    #print(docword)
                    #print(rmword)
                    #rows[key2]['value'] = 'black'
                    #print(type(rows))
                    #print('\n matchcount: ',matchcount, file=sys.stderr)
        with open('static/markedRTree.csv','w') as csv_f:
            csv_f.write('id,value')
            csv_f.write('\n')
            for line in rows:
                print(line)
                csv_f.write(line['id'])
                csv_f.write(',')
                csv_f.write(line['value'])
                csv_f.write('\n')
            csv_f.close()
            #writer = csv.writer(csv_f,delimiter=',')
            #writer.writerow('id,value')
            #for line in rows:
#                print(line)
#                writer.writerow(line['id'],line['value'])
    return json.dumps({'rmterms':rmwordcount,'docwords':doclen,'matchcount':matchcount});

            
@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/signUpUser',methods=['POST'])
def signUpUser():
    user = request.form['username'];
    password = request.form['password'];
    return json.dumps({'status':'OK','user':user,'pass':password});

def clean(rawdata):
       tokenizer = RegexpTokenizer(r'\w+')
       # create English stop words list
       en_stop = get_stop_words('en')
       en_stop.append('yes')
       en_stop.append('org')
       en_stop.append('can')
       en_stop.append('ye')
       en_stop.append('e')
       en_stop.append('g')
       en_stop.append('will')
       en_stop.append('http')
       en_stop.append('www')
       en_stop.append('et')
       en_stop.append('al')
       en_stop.append('de')
       # Create p_stemmer of class PorterStemmer
       p_stemmer = PorterStemmer()

       # list for tokenized documents in loop
       texts = []
       # clean and tokenize document string
       lowraw = rawdata.lower()
       tokens = tokenizer.tokenize(lowraw)
       # remove stop words from tokens
       stopped_tokens = [i for i in tokens if not i in en_stop]
       # remove ditigs from tokens
       without_digits = [i for i in stopped_tokens if not i.isdigit()]
       # stem tokens
       #stemmed_tokens = [p_stemmer.stem(i) for i in without_digits]
       stemmed_tokens = without_digits
       # remove_characterOrOneDigit_tokens
       stemmed_without_character = [i for i in stemmed_tokens if not (len(i)==1)]
       # print(stemmed_without_character)
       # add tokens to list
       texts.append(stemmed_without_character)
       return texts


if __name__ == "__main__":
    app.run(debug = True)
