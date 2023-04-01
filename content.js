chrome.runtime.onMessage.addListener(
      function(request) {
        switch (request.message) {
            case "process":
                process(request.text);
                window.scrollTo(0, 0);
                break;
            case "address_process":
                addr_process(request.text);
                break;
            case "scanTaobao":
                scanTaobao();
                break;
            case "scanTaobaoM":
                scanTaobaoMobile();
                break;
            case "scan1688":
                scan1688();
                break;
            case "scan1688M":
                scan1688Mobile();
                break;
            case "alert":
                alert(request.text);
                break;
            case "log":
                console.log(request.text);
                break;
         }
      }
    );

function determineStore(text) {
    try {
        let first_line = /(^.*)\n/.exec(text)[1];
        let storeDict = {
            "상품주문정보 조회": "naver",
            "주문상세조회": "coupang"
        };
        if (first_line in storeDict) {
            return storeDict[first_line];
        } else {
            return false;
        }
    } 
    catch (err) {
        return false;
    }
}

function naver(text){
    let data = {};
    data.receiver_name = /수취인명\t(.+)\n/.exec(text)[1];
    data.PCC = /개인통관고유부호\t(.+)\n/.exec(text)[1];
    let contact = /연락처1\t(\d{3})-(\d{4})-(\d{4})/.exec(text);
    data.contact_1 = contact[1];
    data.contact_2 = contact[2];
    data.contact_3 = contact[3];
    let address = /배송지\t(.*)\n(.*)\n/.exec(text);
    data.address_1 = address[1];
    data.address_2 = address[2];
    data.request = /배송메모\t(.*)\n/.exec(text)[1];
    return data;
}
    
function coupang(text){
    let data = {};
    data.receiver_name = /수취인명\t(.+?)\t/.exec(text)[1];
    let address = /배송주소\t\((\d+)\) (.*)\n/.exec(text);
    data.postcode = address[1];
    data.address_1 = address[2];
    data.request = /배송메모\t(.*)/.exec(text)[1];
    return data;
}
    
function process(text) {
    if (!text) { 
        text = getPasted();
    }
    let store = determineStore(text);
    let data;
    try {
        if (store == "naver") {data = naver(text);}
        else if (store == "coupang") {data = coupang(text);}
        else {data = {};}
    } catch (err) {
        alert("Please type valid text: not \""+text+"\"");
        console.log(err);
        data = {};
    }
    let nameCode = {"receiver_name": "ADRS_KR",
                    "PCC": "RRN_NO",
                     "contact_1": "MOB_NO1",
                     "contact_2": "MOB_NO2",
                     "contact_3": "MOB_NO3",
                     "postcode": "ZIP",
                     "address_1": "ADDR_1",
                     "address_2": "ADDR_2",
                     "request": "REQ_1"};
    for (const [key, value] of Object.entries(data)) {
        document.querySelector('input[name=\"' + nameCode[key] + '\"]').value = value;
        }
    if ("address_1" in data) {
        document.querySelectorAll('a[class="btn_red1 vm"]')[1].click();
    }   
    return true;
}

function addr_process(text) {
    if (!text) { 
        text = getPasted();
    }
    let store = determineStore(text);
    if (store == "naver") {data = naver(text);}
    else if (store == "coupang") {data = coupang(text);}
    else {data = {};}
    document.querySelector('input[name="keyword"]').value = data.address_1;
    document.querySelector('a[class="btn_cancel"]').click();
    setTimeout(function() {
        document.querySelector('select[id="searchJusoaddr1"]').getElementsByTagName('option')[1].selected = 'selected';
        document.querySelector('select[id="searchJusoaddr1"]').dispatchEvent(new Event('change'));
    }, 1500);
}

function getPasted() {
    try {
        let input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = "";
        input.select();
        document.execCommand("paste");
        let text = input.value;
        input.remove();
        return text;
    }
    catch (err) {
        alert(err);
        return "";
    }
}

function scanTaobao() {
    var order_ids = [];
    var i = 0;
    
    chrome.runtime.sendMessage({"message": "reset"});
    var elements = document.querySelectorAll('div[class="bought-wrapper-mod__trade-order___2lrzV"]');
    elements.forEach(function(element) {
        try {
            let datalet, reglet, elementlet, isFound;
            datalet = {};
            datalet.time = Date.now();
            datalet.order_id = element.getAttribute("data-id");
            isFound = order_ids.includes(datalet.order_id);
            if (!isFound) {
                elementlet = element.querySelector('a[class="production-mod__pic___G8alD"]').getAttribute("href");
                reglet = /\?id=(\d{5,})/g.exec(elementlet);
                if (reglet != null) {
                   datalet.product_id = reglet[1];
                }
                fetch("https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=" + datalet.order_id)
                    .then(res => res.json())
                    .then(response => {
                        datalet.express_id = response.expressId;
                        chrome.runtime.sendMessage({"message": "add", "data": datalet});
                        })
                    .catch(err => {
                        console.log('Fetch error', err);
                        return false;
                        });
                    order_ids.push(datalet.order_id);
            }
            i++;
            if (i === elements.length) {
                setTimeout(function () {
                    chrome.runtime.sendMessage({"message": "execute", "site": "Taobao", "environment": "PC"});
                }, 2000);
            }
        }
        catch (err) {
            alert(err);
        }
        });
}

function scanTaobaoMobile() {
    var order_ids = [];
    var i = 0;
    chrome.runtime.sendMessage({"message": "reset"});
    var elements = document.getElementsByClassName('sellerInfo');
    var parser = new DOMParser();
    var payload = {headers: {'Content-Type': 'text/html', 'Access-Control-Allow-Origin':'h5.m.taobao.com'}, mode: 'cors'};
    for (let element of elements) {
        try {
            let datalet, reglet, elementlet, isFound;
            datalet = {};
            datalet.time = Date.now();
            elementlet = element.getAttribute("data-spm");
            reglet = /sellerInfo_(\d{5,})/g.exec(elementlet);
            if (reglet != null) {
               datalet.order_id = reglet[1];
            }
            
            isFound = order_ids.includes(datalet.order_id);
            if (!isFound) {
                datalet.product_id = "N/A";
                fetch("https://market.m.taobao.com/app/dinamic/h5-tb-logistics/home?orderId=" + datalet.order_id, payload)
                    .then(res => res.text())
                    .then(resp => {
                        console.log(resp);
                        doc = parser.parseFromString(resp, "text/html");
                        lis = doc.getElementsByClassName("rax-text-v2");
                        console.log(lis);
                        if (lis.length > 1) {
                            reglet = /(\w*\d{5,})/g.exec(lis[1].innerHTML);
                            if (reglet != null) {
                                datalet.express_id = reglet[1];
                                chrome.runtime.sendMessage({"message": "add", "data": datalet});
                            }
                        }
                        })
                    .catch(err => {
                        console.log('Fetch error', err);
                        return false;
                        });
                    order_ids.push(datalet.order_id);
            }
            i++;
            if (i === elements.length) {
                setTimeout(function () {
                    chrome.runtime.sendMessage({"message": "execute", "site": "Taobao", "environment": "Mobile"});
                }, 2000);
            }
        }
        catch (err) {
            console.log(err);
            alert(err);
        }
        }
}

function scan1688() {
    var order_ids = [];
    var i = 0;
    
    chrome.runtime.sendMessage({"message": "reset"});
    var elements = Array.from(document.getElementsByClassName("order-item"));
    var parser = new DOMParser();
    var payload = {headers: {'Content-Type': 'text/html'}, mode: 'cors', credentials: 'include'};
    elements.forEach(function(element) {
        try {
            let datalet, isFound, elementlet, reglet, doc, lis;
            datalet = {};
            datalet.time = Date.now();
            datalet.order_id = element.querySelector('input[class="tradeId"]').getAttribute("value");
            isFound = order_ids.includes(datalet.order_id);
            if (!isFound) {
                elementlet = element.querySelector('a[class="productName"]').getAttribute("href");
                reglet = /(\d{5,})/g.exec(elementlet);
                if (reglet != null) {
                   datalet.product_id = reglet[1];
                }
                fetch("https://trade.1688.com/order/new_step_order_detail.htm?orderId=" + datalet.order_id + "&tracelog=20120313bscentertologisticsbuyer&#logisticsTabTitle", payload)
                    .then(res => res.text())
                    .then(resp => {
                        doc = parser.parseFromString(resp, "text/html");
                        lis = doc.getElementsByClassName("info-item-val");
                        if (lis.length > 2) {
                            reglet = /(\w*\d{5,})/g.exec(lis[2].innerHTML);                            
                            if (reglet != null) {
                                datalet.express_id = reglet[1];
                                chrome.runtime.sendMessage({"message": "add", "data": datalet});
                            }
                        }
                        })
                    .catch(err => {
                        console.log('Fetch error', err);
                        });
                    order_ids.push(datalet.order_id);
            }
            i++;
            if (i === elements.length) {
                setTimeout(function () {
                    chrome.runtime.sendMessage({"message": "execute", "site": "1688", "environment": "PC"});
                }, 2000);
            }
        }
        catch (err) {
            alert(err);
        }
        });
}

function scan1688Mobile() {
    var order_ids = [];
    var i = 0;
    var scrollEle = document.getElementsByClassName("rax-scrollview-vertical")[0];
    var interval = setInterval(function(){
        if (document.getElementsByClassName("list-page--bottomText--18PiVqh").length){
            clearInterval(interval);
            scrollEle.scrollTo(0, 0);
            
        } else{
            scrollEle.scrollTo(0, scrollEle.scrollHeight);
        }
    }, 200);
    chrome.runtime.sendMessage({"message": "reset"});
    var elements = Array.from(document.getElementsByClassName("order-item"));
    var parser = new DOMParser();
    var payload = {headers: {'Content-Type': 'text/html'}, mode: 'cors', credentials: 'include'};
    elements.forEach(function(element) {
        try {
            let datalet, isFound, reglet, doc, lis;
            datalet = {};
            datalet.time = Date.now();
            datalet.order_id = element.querySelector('input[class="tradeId"]').getAttribute("value");
            isFound = order_ids.includes(datalet.order_id);
            if (!isFound) {
                datalet.product_id = element.querySelector('a[class="productName"]').getAttribute("href");
                fetch("https://trade2.m.1688.com/page/logisticsDetail.html?orderId=" + datalet.order_id + "&userRole=buyer", payload)
                    .then(res => res.text())
                    .then(resp => {
                        doc = parser.parseFromString(resp, "text/html");
                        lis = doc.getElementsByClassName("val");
                        if (lis.length > 0) {
                            reglet = /(\w*\d{5,})/g.exec(lis[0].innerHTML);
                            if (reglet != null) {
                                datalet.express_id = reglet[1];
                                chrome.runtime.sendMessage({"message": "add", "data": datalet});
                                }
                            }
                        })
                    .catch(err => {
                        console.log('Fetch error', err);
                        });
                    order_ids.push(datalet.order_id);
            }
            i++;
            if (i === elements.length) {
                setTimeout(function () {
                    chrome.runtime.sendMessage({"message": "execute", "site": "1688", "environment": "PC"});
                }, 2000);
            }
        }
        catch (err) {
            alert(err);
        }
        });
}