try {
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            case 'submitNaver':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "copy&process", "store": "naver"});
                });
                break;
            case 'submitSSG':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "copy&process", "store": "ssg"});
                });
                break;
            case 'submitCoupang':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "copy&process", "store": "coupang"});
                });
                break;
            default:
                console.log(`Command ${command} not found`);
        }
    });
    }
catch(err) {
        console.log('Error');
    }