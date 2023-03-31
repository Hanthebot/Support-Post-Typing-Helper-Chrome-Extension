function submitT () {
    b_submit();
    setTimeout(function() {
     addr_submit();
    }, 2000);
}

function b_submit () {
    var text = document.getElementById("textbox").value;
    var store = document.querySelector('input[name="store"]:checked').value;
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"message": "process", "store": store, "text": text});
    });
}

function paste () {
    document.getElementById("textbox").select();
    try {
        var successful = document.execCommand('paste');
        var msg = successful ? 'Pasted' : 'Unable to paste';
        console.log(msg);
    } catch(err) {
        console.log('Unable to paste');
    }
}

function addr_submit () {
    var text = document.getElementById("textbox").value;
    var store = document.querySelector('input[name="store"]:checked').value;
    chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "store": store, "text": text});
    });
}

function scanTaobao() {
    chrome.tabs.query({}, function(tabs) {
     let found = false;
     for (var i=0; i < tabs.length; i++) {
        if (/https?:\/\/buyertrade\.taobao\.com\/trade\/itemlist\/list_bought_items\.htm/.test(tabs[i].url)) {
            found = true;
            chrome.tabs.sendMessage(tabs[0].id, {"message": "scan"});
            break; // you found it, stop searching and update the tab
        } else if (/https?:\/\/h5\.m\.taobao\.com\/mlapp\/olist.html\?.*tabCode=waitConfirm/.test(tabs[i].url)) {
            found = true;
            chrome.tabs.sendMessage(tabs[0].id, {"message": "scanM"});
            break;
        }
    }

    if (!found) {
       chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"message": "alert", "text": "No window found"});
      });
    }
   });
}

document.addEventListener('DOMContentLoaded', function() {
 document.getElementById('paste').addEventListener("click", paste);
 document.getElementById('submit').addEventListener("click", submitT);
 document.getElementById('taobao').addEventListener("click", scanTaobao);
 }, false);