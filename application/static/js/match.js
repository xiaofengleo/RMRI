    // launch the preprocess procedures

function match() {

datatosend = document.getElementById("preprocessed-text").innerHTML;

runPyMatchScript(datatosend);

}

function runPyMatchScript(input){

var jqXHR = $.ajax({
url:"/match",
type:'POST',
cache:false,
data:{mydata:input},
async:true,
success:function(data){
	document.getElementById("statistics").innerHTML = data; 
},
error:function(request,status,error){
alert(error);
}
})

return jqXHR.responseText;

}
    /*function match() {
	var rmlength;
	var doclength;
	var matchcount;

       preprocessString = document.getElementById("preprocessed-text").innerHTML;
        preprocessObj = JSON.parse(preprocessString);
        console.log('Got back ' + preprocessObj.status);
        console.log('Got back ' + preprocessObj.result[0][1]);
	d3.csv("static/RTreeData.csv",function(erroe,data){
	if(erroe) throw error;
	console.log('RTreeData ',data);

	rmlength = data.length;
	doclength = preprocessObj.result[0].length;
	for(var key =0; key< doclength; key++)
	{
		docword = preprocessObj.result[0][key];
		for(var key2 =0; key2<rmlength; key2++)
		{
				rmword = data[key2].id;
				if(rmword.indexOf(docword)!== -1)
				{
					matchcount++;
				}
		}	
	}

	})
	document.getElementById("statistics").innerHTML += "Reference Model: "; 
	document.getElementById("statistics").innerHTML += rmlength; 
	document.getElementById("statistics").innerHTML += "Document: "; 
	document.getElementById("statistics").innerHTML += doclength; 
	document.getElementById("statistics").innerHTML += "Match: "; 
	document.getElementById("statistics").innerHTML += matchcount; 

    }
*/
