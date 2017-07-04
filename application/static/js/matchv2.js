    // launch the preprocess procedures

function matchv2() {

datatosend = document.getElementById("preprocessed-text").innerHTML;

runPyMatchScript(datatosend);

}

function runPyMatchScript(input){

var jqXHR = $.ajax({
url:"/matchv2",
type:'POST',
cache:false,
data:{mydata:input},
async:true,
success:function(data){
	obj =JSON.parse(data);
	document.getElementById("statistics").innerHTML = JSON.stringify(obj.dict1); 
	document.getElementById("statistics2").innerHTML = JSON.stringify(obj.dict2); 
},
error:function(request,status,error){
alert(error);
}
})

markred_rm_hierarchy_svg();

return jqXHR.responseText;

}
