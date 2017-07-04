    // launch the extract topic procedures
    function extracttopic() {
       datatosend = document.getElementById("feature-text").innerHTML;
        result = runPyScript(datatosend);
    //    console.log('Got back ' + result);
    }



function runPyScript(input){
	
	var jqXHR = $.ajax({
		url:"/extracttopic",
		type:'post',
		cache:false,
		data:{mydata:input},
		async:true,
		success: function(data) {
			document.getElementById("preprocessed-text").innerHTML = data;
      },
		error: function(request, status, error) {
        alert(error);
      }
   });
	 return jqXHR.responseText;
	 
}
