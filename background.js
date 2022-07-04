try {
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            case 'submitNaver':
            case 'submitCoupang':
                storeDict = {"submitNaver": "naver", "submitCoupang": "coupang"};
                store = storeDict[command];
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {"message": "process", "store": store, "text": false});
                });
                setTimeout(function() {
                    chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "store": store, "text": false});
                    });
                }, 2000);
                break;
            default:
                console.log(`Command ${command} not found`);
                break;
        }
    });
    }
catch(err) {
        console.log('Error');
    }