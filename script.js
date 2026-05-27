let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url,retry=3){

    for(let i=0;i<=retry;i++){

        try{

            const response = await fetch(url,{
                cache:"no-cache"
            });

            if(response.ok){

                return response;

            }

        }catch(e){

        }

        await new Promise(r=>setTimeout(r,400));

    }

    throw new Error("FETCH FAIL");

}

async function getTicker(symbol){

    const url =
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;

    const response =
    await safeFetch(url);

    return await response.json();

}

async function getKlines(symbol){

    const url =
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`;

    const response =
    await safeFetch(url);

    return await response.json();

}

async function getGlobalData(){

    const response =
    await safeFetch(
        "https://api.coingecko.com/api/v3/global"
    );

    return await response.json();

}

function calcMA(closes,length){

    const result = [];

    for(let i=0;i<closes.length;i++){

        if(i < length-1){

            result.push(null);

        }else{

            const slice =
            closes.slice(
                i-length+1,
                i+1
            );

            const avg =
            slice.reduce(
                (a,b)=>a+b,
                0
            ) / length;

            result.push(avg);

        }

    }

    return result;

}

function calcSlope(values){

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

    return (
        (
            last - first
        ) / first
    ) * 100;

}

function renderPredictBoxes(containerId,predict){

    const container =
    document.getElementById(
        containerId
    );

    if(!container){

        return;

    }

    const abs =
    Math.abs(predict);

    let html = "";

    const isUp =
    predict >= 0;

    const colorClass =
    isUp
    ? "green-box"
    : "red-box";

    const arrow =
    isUp
    ? "▲"
    : "▼";

    const levels = [

        {
            label:"1%",
            active:abs >= 1
        },

        {
            label:"1.5%",
            active:abs >= 1.5
        },

        {
            label:"2%",
            active:abs >= 2
        }

    ];

    for(const lv of levels){

        html += `

        <div class="predict-line">

            <div class="
                predict-left
                ${isUp ? 'up-text' : 'down-text'}
            ">

                ${arrow} ${lv.label}

            </div>

            <div class="predict-right">

                <div class="
                    predict-square
                    ${lv.active ? colorClass : ''}
                "></div>

                <div class="
                    predict-square
                    ${lv.active ? colorClass : ''}
                "></div>

                <div class="
                    predict-square
                    ${lv.active ? colorClass : ''}
                "></div>

                <div class="
                    predict-square
                    ${lv.active ? colorClass : ''}
                "></div>

            </div>

        </div>

        `;

    }

    container.innerHTML = html;

}

function renderCoin(side,data){

    const priceEl =
    document.getElementById(
        `${side}Price`
    );

    const infoEl =
    document.getElementById(
        `${side}Info`
    );

    const predictEl =
    document.getElementById(
        `${side}Prediction`
    );

    if(priceEl){

        priceEl.innerHTML = `
        ${data.symbol}USDT :
        <br>
        ${data.price.toFixed(4)}
        `;
    }

    renderPredictBoxes(
        `${side}Boxes`,
        data.predict
    );

    if(predictEl){

        predictEl.innerHTML = `
        1-3H Prediction :
        ${data.predict.toFixed(2)}%
        (Target:
        ${data.target.toFixed(4)})
        `;
    }

    if(infoEl){

        infoEl.innerHTML = `
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
    input.value
    .toUpperCase()
    .trim();

    try{

        const klines =
        await getKlines(symbol);

        const closes =
        klines.map(
            k=>parseFloat(k[4])
        );

        const price =
        closes[
            closes.length-1
        ];

        const ma5 =
        calcMA(closes,5);

        const ma15 =
        calcMA(closes,15);

        const ma30 =
        calcMA(closes,30);

        const ma5slope =
        calcSlope(
            ma5.slice(-5).filter(v=>v)
        );

        const ma15slope =
        calcSlope(
            ma15.slice(-5).filter(v=>v)
        );

        const ma30slope =
        calcSlope(
            ma30.slice(-5).filter(v=>v)
        );

        let predict =

            ma5slope * 0.5 +

            ma15slope * 0.3 +

            ma30slope * 0.2;

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
            1 + predict / 100
        );

        const data = {

            symbol,
            price,
            target,
            predict,

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

        renderCoin(side,data);

    }catch(e){

        console.log(e);

        const cache =
        side === "left"
        ? leftCache
        : rightCache;

        if(cache){

            renderCoin(side,cache);

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
        `HK UPDATE TIME : ${hk}`;

    }

}

function renderMacro(data){

    const macro =
    document.getElementById(
        "macroArea"
    );

    if(!macro){

        return;

    }

    macro.innerHTML = `

    <div class="macro-main-title">

        BTC 宏觀方向（4-24H）

    </div>

    <div class="macro-status-row">

        <span class="macro-dot">
        ${data.icon}
        </span>

        <span class="macro-status">
        ${data.status}
        </span>

    </div>

    <div class="macro-price">
        BTC:
        ${data.btc.toFixed(2)}
    </div>

    <div class="macro-price">
        ETH:
        ${data.eth.toFixed(2)}
    </div>

    <div class="macro-price">
        TOTAL MARKET:
        ${data.marketCap}
    </div>

    <div class="macro-price">
        BTC DOM:
        ${data.btcDom}
    </div>

    `;

}

async function loadMacro(){

    try{

        const btc =
        await getTicker("BTC");

        const eth =
        await getTicker("ETH");

        const global =
        await getGlobalData();

        const btcPrice =
        parseFloat(btc.price);

        const ethPrice =
        parseFloat(eth.price);

        const marketCap =
        global.data
        .total_market_cap
        .usd;

        const btcDom =
        global.data
        .market_cap_percentage
        .btc;

        let status =
        "中性震盪";

        let icon =
        "🟡";

        if(btcPrice > 90000){

            status =
            "強勢偏多";

            icon =
            "🟢";

        }

        if(btcPrice < 65000){

            status =
            "偏弱震盪";

            icon =
            "🔴";

        }

        const data = {

            btc:
            btcPrice,

            eth:
            ethPrice,

            marketCap:
            "~" +
            (
                marketCap /
                1000000000000
            ).toFixed(2)
            + "T",

            btcDom:
            btcDom.toFixed(2)
            + "%",

            status,
            icon

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

function startSystem(){

    updateHKTime();

    loadCoin("left");

    loadCoin("right");

    loadMacro();

    setInterval(
        updateHKTime,
        1000
    );

    setInterval(()=>{

        loadCoin("left");

        loadCoin("right");

    },15000);

    setInterval(
        loadMacro,
        45000
    );

}

startSystem();
