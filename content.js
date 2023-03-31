chrome.runtime.onMessage.addListener(
      function(request) {
        var data;
        switch (request.message) {
            case "process":
                if (request.text) { 
                    text = request.text;
                } else {
                    text = getPasted();
                }
                if (request.store == "naver") {data = naver(text);}
                else if (request.store == "coupang") {data = coupang(text);}
                else {data = {};}
                process(data);
                window.scrollTo(0, 0);
                break;
            case "address_process":
                if (request.text) { 
                    text = request.text;
                } else {
                    text = getPasted();
                }
                if (request.store == "naver") {data = naver(text);}
                else if (request.store == "coupang") {data = coupang(text);}
                else {data = {};}
                document.querySelector('input[name="keyword"]').value = data.address_1;
                document.querySelector('a[class="btn_cancel"]').click();
                setTimeout(function() {
                    document.querySelector('select[id="searchJusoaddr1"]').getElementsByTagName('option')[1].selected = 'selected';
                    document.querySelector('select[id="searchJusoaddr1"]').dispatchEvent(new Event('change'));
                }, 1500);
                break;
            case "scan":
                scanTaobao();
                break;
            case "scanM":
                scanTaobaoMobile();
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

function naver(text){
    try {
        var data = {};
        data.receiver_name = text.split("수취인명	")[1].split("\n")[0];
        data.PCC = text.split("개인통관고유부호	")[1].split("\n")[0];
        var contact = text.split("연락처1	")[1].split("	")[0].split("-");
        data.contact_1 = contact[0];
        data.contact_2 = contact[1];
        data.contact_3 = contact[2];
        var address = text.split("배송지	")[text.split("배송지	").length - 1].split("\n배송메모	")[0].split("\n");
        data.address_1 = address[0];
        data.address_2 = address[1];
        data.request = text.split("배송메모	")[1].split("\n")[0];
        return data;
    } catch (err) {
        alert("Please type valid text: not \""+text+"\"");
        console.log(err);
        return {};
    }
}
    
function coupang(text){
    try {
        var data = {};
        alert("Store option comming soon");
        console.log(text);
        return data;
    } catch (err) {
        alert("Please type valid text: not \""+text+"\"");
        console.log(err);
        return {};
    }
}
    
function process(inputData) {
    var nameCode = {"receiver_name": "ADRS_KR",
                    "PCC": "RRN_NO",
                     "contact_1": "MOB_NO1",
                     "contact_2": "MOB_NO2",
                     "contact_3": "MOB_NO3",
                     "postcode": "ZIP",
                     "address_1": "ADDR_1",
                     "address_2": "ADDR_2",
                     "request": "REQ_1"};
    for (const [key, value] of Object.entries(inputData)) {
        document.querySelector('input[name=\"' + nameCode[key] + '\"]').value = value;
        }
    if ("address_1" in inputData) {
        document.querySelectorAll('a[class="btn_red1 vm"]')[1].click();
    }
        
    return true;
}

function getPasted() {
    try {
        let input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = "";
        input.select();
        document.execCommand("paste");
        var text = input.value;
        input.remove();
        return text;
    }
    catch (err) {
        alert(err);
        return "";
    }
}

/*
 a class = bought-wrapper-mod__th-operation___yRtHm
https://trade.taobao.com/trade/memo/update_buy_memo.htm?bizOrderId=3260803285002089602&buyerId=2510080296&user_type=0&pageNum=1&auctionTitle=null&daetBegin=null&dateEnd=null&commentStatus=null&sellerNick=null&auctionStatus=NOT_SEND&isArchive=false&logisticsService=null&visibility=true

a class = production-mod__pic___G8alD
href = https://item.taobao.com/item.htm?id=704059237193&_u=g2appi988466
*/
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
            isFound = order_ids.some(element => {
                if (element === datalet.order_id) {
                    return true;
                    }
                return false;
                });
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
                    chrome.runtime.sendMessage({"message": "execute"});
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
    //https://h5.m.taobao.com/mlapp/olist.html?tabCode=waitConfirm
    chrome.runtime.sendMessage({"message": "reset"});
    var elements = document.getElementsByClassName('sellerInfo');
    console.log(elements);
    for (let element of elements) {
        try {
            let datalet, reglet, elementlet, isFound;
            datalet = {};
            datalet.time = Date.now();
            console.log(element);
            elementlet = element.getAttribute("data-spm");
            console.log(elementlet);
            reglet = /sellerInfo_(\d{5,})/g.exec(elementlet);
            if (reglet != null) {
               datalet.order_id = reglet[1];
            }
            
            isFound = order_ids.some(element => {
                if (element === datalet.order_id) {
                    return true;
                    }
                return false;
                });
            if (!isFound) {
                datalet.product_id = "N/A";
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
                    chrome.runtime.sendMessage({"message": "execute"});
                }, 2000);
            }
        }
        catch (err) {
            console.log(err);
            alert(err);
        }
        }
}