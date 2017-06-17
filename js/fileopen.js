	    // The Browser API key obtained from the Google API Console.
    // Replace with your own Browser API key, or your own key.
    var developerKey = 'AIzaSyDglOyiOnIxXyEiJ2hcn1QK4KANFA8oMh8';

    // The Client ID obtained from the Google API Console. Replace with your own Client ID.
    var clientId = "426725020027-c0erhhd2hlh153hf1vlav1kip24ftt4q.apps.googleusercontent.com"

    // Replace with your own project number from console.developers.google.com.
    // See "Project number" under "IAM & Admin" > "Settings"
    var appId = "4267250200271234567890";

    // Scope to use to access user's Drive items.
    var scope = ['https://www.googleapis.com/auth/drive'];
//var scope = ['https://www.googleapis.com/auth/drive.metadata.readonly']
    var pickerApiLoaded = false;
    var oauthToken;

    // Use the Google API Loader script to load the google.picker script.
    function loadPicker() {
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker', {'callback': onPickerApiLoad});
    }

    function onAuthApiLoad() {
      window.gapi.auth.authorize(
          {
            'client_id': clientId,
            'scope': scope,
            'immediate': false
          },
          handleAuthResult);
    }

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }

    // Create and render a Picker object for searching images.
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("text/plain,application/vnd.google-apps.folder");
        var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(appId)
            .setOAuthToken(oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setDeveloperKey(developerKey)
            .setCallback(pickerCallback)
            .build();
         picker.setVisible(true);
      }
    }




    // A simple callback implementation.
    function pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {

	var docs = data[google.picker.Response.DOCUMENTS];
    docs.forEach(function (file) {
		var fileid = file.id;
	//alert(fileid);	
		var downloadurl = 'https://www.googleapis.com/drive/v3/files/' + fileid +'?alt=media'; 
		//https://www.googleapis.com/drive/v3/files/0ByZcl5tCaPn6Sk11UGYzNUFlcHM?alt=media
		if (downloadurl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', downloadurl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
	document.getElementById("feature-text").innerHTML = xhr.responseText;// "Hello World";
     // alert(xhr.responseText);
		//callback(xhr.responseText);
    };
    xhr.onerror = function() {
      //callback(null);
    };
    xhr.send();
  } else {
    //callback(null);
  }
	})
	  }
}
				 
