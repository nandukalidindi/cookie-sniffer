$(document).ready(function() {
  // chrome.storage.sync.set({'value': 100}, function() {
  //   // Notify that we saved.
  //   // alert('Settings saved');
  // });

  chrome.storage.sync.get('ache', function(response) {

  })

  // if(document.referrer.indexOf(":8084") !== -1) {
    var passwordInputPresent = false;

    try {
      var passwordInput = $("input:password");
      if (typeof passwordInput === "object")
        passwordInputPresent = true;
    } catch(error) {
      passwordInputPresent = false;
    }

    if(passwordInputPresent) {
       chrome.runtime.sendMessage({
         method: 'startTailing',
         domain: document.domain
        }, function(response) {
       });
      // chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
      //   if (msg.action === 'SendIt') {
      //     alert("Message recieved!");
      //   }
      // });
    }
  // }
});
