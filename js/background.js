var list = [];

try {
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            case 'pasteKR':
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {"message": "process", "text": false});
                });
                setTimeout(function() {
                    chrome.tabs.query({url: "https://www.s-post.kr/Library/Html/ZipSearchPop_S.asp"}, function (tabs) {
                        if (tabs.length) {
                        chrome.tabs.sendMessage(tabs[0].id, {"message": "address_process", "text": false});
                        }
                    });
                }, 2000);
                break;
            case 'scanCN':
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
                break;
            default:
                console.log(`Command ${command} not found`);
                break;
        }
    });
    chrome.runtime.onMessage.addListener(function(request) {
        switch (request.message) {
            case "reset":
                list = [];
                break;
            case "add":
                list.push(request.data);
                break;
            case "execute":
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {"message": "log", "text": "Crawling completed."});
                });
                let payload = {"site": request.site, "data": list};
                let init = {
                    redirect: "follow",
                    method: 'POST',
                    crossDomain: true,
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(payload)
                };
                let url = "https://script.google.com/macros/s/AKfycbwf-ZqZfMKV4yVzY3JaOwKrYLCH7dDR1Njhe6BgAYbFkDubd333Wsvy1ntrwLNk3wCpDg/exec";
                fetch(url , init)
                  .then((response) => response.json())
                  .then(function(res) {
                    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                        if (res.code === 200) {
                            chrome.tabs.sendMessage(tabs[0].id, {"message": "alert", "text": "Submitted!"});
                            chrome.tabs.sendMessage(tabs[0].id, {"message": "log", "text": "Submission completed"});
                        } else if (res.code === 0) {
                            chrome.tabs.sendMessage(tabs[0].id, {"message": "alert", "text": "Error: " + res.message});
                            chrome.tabs.sendMessage(tabs[0].id, {"message": "log", "text": "Submission failed; error: " + res.message});
                        }
                        });
                    })
                  .catch((err) => {
                        console.log('Fetch error' + err);
                        });
                break;
            default:
                break;
        }
        });
    }
catch(err) {
        console.log('Error', err);
    }