chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  var initialCookie = null,
      intervalBuiltCookie = null,
      intervalBuiltSerializedCookie = null;
      attempts = 0;

  buildCookie(request.domain).then(function(response) {
    initialCookie = response.stringifiedCookie;
    intervalBuiltCookie = response.stringifiedCookie;
    intervalBuiltSerializedCookie = response.serializableCookie;

    if(request.method === 'startTailing') {
      var interval = setInterval(function() {
        if(attempts > 10)
          clearInterval(interval);

        if(initialCookie !== intervalBuiltCookie) {
          var data = {};
          data[request.origin] = intervalBuiltSerializedCookie;

          chrome.storage.sync.get('ache', function(response) {
            if(response.ache) {
              postToAche(response.ache, data);
            }
          });
          clearInterval(interval);
        }
        attempts++;
        buildCookie(request.domain).then(function(response) {
          intervalBuiltCookie = response.stringifiedCookie;
          intervalBuiltSerializedCookie = response.serializableCookie;
        });
      }, 3000);
    } else if (request.method === 'cookieMessenger') {
      var data = {};
      data[request.origin] = intervalBuiltSerializedCookie;

      chrome.storage.sync.get('ache', function(response) {
        if(response.ache) {
          postToAche(response.ache, data);
        }
      });
    }
  });
});

function buildCookie(domainName) {
  var fullCookie = [],
      serializableCookie = [];

  return new Promise(function(success, error) {
    try {
      chrome.cookies.getAll({domain: domainName}, function(response) {
        response.forEach(function(cookie) {
          fullCookie.push(cookie.name + "=" + cookie.value);
          serializableCookie.push(mutateCookieResponse(cookie));
        })

        success({stringifiedCookie: fullCookie.join("; "), serializableCookie: serializableCookie});
      })
    } catch(err) {
      error(err)
    }
  });

}

function mutateCookieResponse(cookie) {
  var requiredKeyMap = {
    domain: "domain",
    expirationDate: "expiresAt",
    hostOnly: "hostOnly",
    httpOnly: "httpOnly",
    name: "name",
    path: "path",
    secure: "secure",
    value: "value",
    persistent: null
  }

  var mutatedObject = {};
  Object.keys(requiredKeyMap).forEach(function(key) {
    mutatedObject[requiredKeyMap[key]] = cookie[key];
  });
  return mutatedObject;
}

function postToAche(url, data) {
  $.ajax({
   url: url + "/cookies",
   method: "POST",
   contentType: "application/json",
   data: JSON.stringify(data),
   success: function(response) {
     console.log(response);
   },
   error: function(err) {
     console.log(err);
   }
 })
}

// ************************ NOTE **************************
// COMMENTING BECAUSE ICON CLICK SHOULD OPEN A POPUP RATHER THAN A NEW BROWSER TAB

// function focusOrCreateTab(url) {
//   chrome.windows.getAll({"populate":true}, function(windows) {
//     var existing_tab = null;
//     for (var i in windows) {
//       var tabs = windows[i].tabs;
//       for (var j in tabs) {
//         var tab = tabs[j];
//         if (tab.url == url) {
//           existing_tab = tab;
//           break;
//         }
//       }
//     }
//     if (existing_tab) {
//       chrome.tabs.update(existing_tab.id, {"selected":true});
//     } else {
//       chrome.tabs.create({"url":url, "selected":true});
//     }
//   });
// }

// chrome.browserAction.onClicked.addListener(function(tab) {
//   var serverPage = chrome.extension.getURL("server-info.html");
//   focusOrCreateTab(serverPage);
// });
