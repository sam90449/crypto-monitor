let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url,retry=2){

    for(let i=0;i<=retry;i++){

        try{

            const response =
            await fetch(url,{

                cache:"no-cache"

            });

            if(response.ok){

                return response;

            }

        }catch(e){

        }

        await new Promise(r=>setTimeout(r,500));

    }

    throw new Error("FETCH FAIL");

}

async function getKlines(symbol){

    const url =
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`;

    const response =
    await safeFetch(url);

    return await response.json();

}

async function getTicker(symbol){

    const url =
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;

    const response =
    await safeFetch(url);

    return await response.json();

}

function calcMA(closes,length){

    const arr = [];

    for(let i=0;i<closes.length;i++){

        if(i < length-1){

            arr.push(null);

        }else{

            const slice =
            closes.slice(i-length+1,i+1);

            const avg =
            slice.reduce((a,b)=>a+b,0)/length;

            arr.push(avg);

        }

    }

    return arr;

}

function slope(values){

    if(values.length < 2){

        return 0;

    }

    const first =
    values[0];

    const last =
    values[values.length-1];

    if(first === 0){

        return 0;

    }

    return ((last-first)/first)*100;

}

function createBoxes(count,isUp){

    let html = "";

    for(let i=0;i<4;i++){

        html += `
        <div class="
            predict-box
            ${i < count ? 'active' : ''}
            ${isUp ? 'green' : 'red'}
        ">
        </div>
        `;

    }

    return html;

}

function createRow(label,count,isUp){

    return `
    <div class="predict-row">

        <div class="
            predict-label
            ${isUp ? 'up' : 'down'}
        ">

            ${isUp ? '▲' : '▼'} ${label}

        </div>

        <div class="predict-boxes">

            ${createBoxes(count,isUp)}

        </div>

    </div>
    `;

}

function renderPredict(percent,id){

    const abs =
    Math.abs(percent);

    let html = "";

    if(percent >= 0){

        html += createRow(
            "1%",
            abs >= 1 ? 1 : 0,
            true
        );

        html += createRow(
            "1.5%",
            abs >= 1.5 ? 2 : 0,
            true
        );

        html += createRow(
            "2%",
            abs >= 2 ? 3 : 0,
            true
        );

    }else{

        html += createRow(
            "1%",
            abs >= 1 ? 1 : 0,
            false
        );

        html += createRow(
            "1.5%",
            abs >= 1.5 ? 2 : 0,
            false
        );

        html += createRow(
            "2%",
            abs >= 2 ? 3 : 0,
            false
        );

    }

    const el =
    document.getElementById(id);

    if(el){

        el.innerHTML = html;

    }

}

function setCoinUI(side,data){

    const priceArea =
    document.getElementById(
        `${side}Price`
    );

    const predictArea =
    document.getElementById(
        `${side}Prediction`
    );

    const detailArea =
    document.getElementById(
        `${side}Info`
    );

    if(priceArea){

        priceArea.innerHTML = `
        ${data.symbol}USDT :
        <br>
        ${data.price.toFixed(4)}
        `;

    }

    renderPredict(
        data.predict,
        `${side}Boxes`
    );

    if(predictArea){

        predictArea.innerHTML = `
        1-3H Prediction :
        ${data.predict.toFixed(2)}%
        (Target:
        ${data.target.toFixed(4)})
        `;

    }

    if(detailArea){

        detailArea.innerHTML = `
        SYMBOL:
        ${data.symbol}USDT

        PRICE:
        ${data.price.toFixed(4)}

        TARGET:
        ${data.target.toFixed(4)}

        5 MA:
        ${data.ma5.toFixed(4)}

        15 MA:
        ${data.ma15.toFixed(4)}

        30 MA:
        ${data.ma30.toFixed(4)}

        5 MA SLOPE:
        ${data.ma5slope.toFixed(4)}%

        15 MA SLOPE:
        ${data.ma15slope.toFixed(4)}%

        30 MA SLOPE:
        ${data.ma30slope.toFixed(4)}%

        FINAL PREDICT:
        ${data.predict.toFixed(4)}%
        `;

    }

}

async function loadCoin(side){

    const input =
    document.getElementById(
        `${side}Input`
    );

    const symbol =
    input.value.toUpperCase().trim();

    try{

        const klines =
        await getKlines(symbol);

        if(!Array.isArray(klines)){

            throw new Error(
                "BAD DATA"
            );

        }

        const closes =
        klines.map(
            k=>parseFloat(k[4])
        );

        const price =
        closes[closes.length-1];

        const ma5 =
        calcMA(closes,5);

        const ma15 =
        calcMA(closes,15);

        const ma30 =
        calcMA(closes,30);

        const ma5slope =
        slope(
            ma5
            .slice(-5)
            .filter(v=>v)
        );

        const ma15slope =
        slope(
            ma15
            .slice(-5)
            .filter(v=>v)
        );

        const ma30slope =
        slope(
            ma30
            .slice(-5)
            .filter(v=>v)
        );

        let predict = (

            ma5slope * 0.5 +

            ma15slope * 0.3 +

            ma30slope * 0.2

        );

        if(isNaN(predict)){

            predict = 0;

        }

        if(predict > 2){

            predict = 2;

        }

        if(predict < -2){

            predict = -2;

        }

        const target =
        price * (
            1 + predict/100
        );

        const data = {

            symbol,
            price,
            predict,
            target,

            ma5:
            ma5[ma5.length-1],

            ma15:
            ma15[ma15.length-1],

            ma30:
            ma30[ma30.length-1],

            ma5slope,
            ma15slope,
            ma30slope

        };

        if(side === "left"){

            leftCache = data;

        }else{

            rightCache = data;

        }

        setCoinUI(side,data);

    }catch(e){

        console.log(e);

        const cache =
        side === "left"
        ? leftCache
        : rightCache;

        if(cache){

            setCoinUI(side,cache);

        }

    }

}

function updateHKTime(){

    const now =
    new Date();

    const hk =
    now.toLocaleString(
        "en-US",
        {
            timeZone:"Asia/Hong_Kong"
        }
    );

    const el =
    document.getElementById(
        "updateTime"
    );

    if(el){

        el.innerHTML =
        "HK UPDATE TIME : " + hk;

    }

}

function renderMacro(data){

    const macroArea =
    document.getElementById(
        "macroArea"
    );

    if(!macroArea){

        return;

    }

    macroArea.innerHTML = `
    <div class="macro-title">
    BTC 宏觀方向 (4-24H)
    </div>

    <div class="macro-score">
    ${data.icon} ${data.text}
    </div>

    <div class="macro-info">
    BTC:
    ${data.price.toFixed(2)}
    </div>

    <div class="macro-info">
    ETH:
    ${data.eth.toFixed(2)}
    </div>

    <div class="macro-info">
    TOTAL MARKET:
    ${data.market}
    </div>

    <div class="macro-info">
    BTC DOM:
    ${data.dom}
    </div>
    `;

}

async function loadMacro(){

    try{

        const btc =
        await getTicker("BTC");

        const eth =
        await getTicker("ETH");

        const btcPrice =
        parseFloat(btc.price);

        const ethPrice =
        parseFloat(eth.price);

        let text =
        "中性震盪";

        let icon =
        "🟡";

        if(btcPrice > 80000){

            text = "強勢偏多";
            icon = "🟢";

        }

        if(btcPrice < 60000){

            text = "偏弱震盪";
            icon = "🔴";

        }

        const data = {

            icon,
            text,

            price:
            btcPrice,

            eth:
            ethPrice,

            market:
            "~3.2T",

            dom:
            "~58%"

        };

        macroCache = data;

        renderMacro(data);

    }catch(e){

        console.log(e);

        if(macroCache){

            renderMacro(macroCache);

        }

    }

}

setInterval(updateHKTime,1000);

setInterval(()=>{

    loadCoin("left");

    loadCoin("right");

},15000);

setInterval(loadMacro,30000);

updateHKTime();

loadCoin("left");

loadCoin("right");

loadMacro();
