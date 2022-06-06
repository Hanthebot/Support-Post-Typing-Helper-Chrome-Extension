function submit () {
    var text = document.getElementById("textbox").value;
    var store = document.querySelector('input[name="store"]:checked').value;
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "process", "store": store, "text": text});
    });
    //document.getElementById("textbox").value = "";
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

document.addEventListener('DOMContentLoaded', function() {
 document.getElementById('paste').addEventListener("click", paste);
 document.getElementById('submit').addEventListener("click", submit);
 }, false);