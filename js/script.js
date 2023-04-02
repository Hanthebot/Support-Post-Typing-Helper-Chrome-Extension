function submitT () {
    b_submit();
    setTimeout(function() {
     addr_submit();
    }, 2000);
}

function b_submit () {
    var text = document.getElementById("textbox").value;
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"message": "process", "text": text});
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
    chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs) {
     if (tabs.length) {
        chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "text": text});
     }
    });
}

function scanCN() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      if (/https?:\/\/buyertrade\.taobao\.com\/trade\/itemlist\/list_bought_items\.htm/.test(tabs[0].url)) {
          chrome.tabs.sendMessage(tabs[0].id, {"message": "scanTaobao"});
      } else if (/https?:\/\/h5\.m\.taobao\.com\/mlapp\/olist.html\?.*tabCode=waitConfirm/.test(tabs[0].url)) {
          chrome.tabs.sendMessage(tabs[0].id, {"message": "scanTaobaoM"});
      } else if (/https?:\/\/trade\.1688\.com\/order\/buyer_order_list\.htm\?.*tradeStatus=waitbuyerreceive/.test(tabs[0].url)) {
          chrome.tabs.sendMessage(tabs[0].id, {"message": "scan1688"});
      } else if (/https?:\/\/trade2\.m\.1688\.com\/page\/buyerOrderList\.html\?.*status=waitbuyerreceive/.test(tabs[0].url)) {
          chrome.tabs.sendMessage(tabs[0].id, {"message": "scan1688M"});
      } else {
          chrome.tabs.sendMessage(tabs[0].id, {"message": "alert", "text": "No window found"});
      }
   });
}

document.addEventListener('DOMContentLoaded', function() {
 document.getElementById('paste').addEventListener("click", paste);
 document.getElementById('submit').addEventListener("click", submitT);
 document.getElementById('scanCN').addEventListener("click", scanCN);
 }, false);