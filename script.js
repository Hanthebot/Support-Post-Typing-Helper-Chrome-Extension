function submitT () {
    b_submit();
    setTimeout(function() {
     addr_submit();
    }, 2000);
    //document.getElementById("textbox").value = "";
}

function b_submit () {
    var text = document.getElementById("textbox").value;
    var store = document.querySelector('input[name="store"]:checked').value;
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
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
    chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs){
        chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "store": store, "text": text});
    });
    //document.getElementById("textbox").value = "";
}

document.addEventListener('DOMContentLoaded', function() {
 document.getElementById('paste').addEventListener("click", paste);
 document.getElementById('submit').addEventListener("click", submitT);
 }, false);