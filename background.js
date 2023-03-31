var list = [];

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
            case 'scanAuto':
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
                console.log("Crawling completed.");
                let init = {
                    method: 'POST',
                    redirect: "follow",
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(list),
                };
                let url = "https://script.google.com/macros/s/AKfycbzVkoQ0K12R1U6LpoMSj_4Nz_5y501n-jv6EPThF6Yxs0-OEqMUYoSrsyAs14DyndpijA/exec";
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
                    });
                break;
            default:
                break;
        }
        });
    }
catch(err) {
        console.log('Error');
    }