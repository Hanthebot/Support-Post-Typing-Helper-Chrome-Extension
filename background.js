try {
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            case 'submitNaver':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "copy&process", "store": "naver"});
                });
                break;
            case 'submitCoupang':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "copy&process", "store": "coupang"});
                });
                break;
            case 'addressNaver':
                chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "store": "naver"});
                });
                break;
            case 'addressCoupang':
                chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "store": "coupang"});
                });
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