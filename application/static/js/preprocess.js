    // launch the preprocess procedures
    function preProcess() {
       datatosend = document.getElementById("feature-text").innerHTML;
        result = runPyScript(datatosend);
    //    console.log('Got back ' + result);
    }



function runPyScript(input){
	
	var jqXHR = $.ajax({
		url:"/pythonpreprocess",
		type:'post',
		cache:false,
		data:{mydata:input},
		async:false,
		success: function(data) {
			document.getElementById("preprocessed-text").innerHTML = data;
      },
		error: function(request, status, error) {
        alert(error);
      }
   });
	 return jqXHR.responseText;
	 
}
