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