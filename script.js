async function getKlines(symbol){

    const url =
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`;

    const response =
    await fetch(url);

    if(!response.ok){

        throw new Error(
            "HTTP " + response.status
        );

    }

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

    document.getElementById(id).innerHTML =
    html;

}

async function loadCoin(side){

    const input =
    document.getElementById(
        `${side}Input`
    );

    const symbol =
    input.value.toUpperCase().trim();

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

    const boxesArea =
    document.getElementById(
        `${side}Boxes`
    );

    try{

        priceArea.innerHTML =
        "LOADING...";

        predictArea.innerHTML =
        "Loading...";

        detailArea.innerHTML =
        "Fetching data...";

        boxesArea.innerHTML =
        "";

        const klines =
        await getKlines(symbol);

        if(!Array.isArray(klines)){

            throw new Error(
                "BAD DATA"
            );

        }

        if(klines.length < 30){

            throw new Error(
                "NO KLINES"
            );

        }

        const closes =
        klines.map(
            k=>parseFloat(k[4])
        );

        const price =
        closes[closes.length-1];

        if(isNaN(price)){

            throw new Error(
                "PRICE NaN"
            );

        }

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

        priceArea.innerHTML = `
        ${symbol}USDT :
        <br>
        ${price.toFixed(4)}
        `;

        renderPredict(
            predict,
            `${side}Boxes`
        );

        predictArea.innerHTML = `
        1-3H Prediction :
        ${predict.toFixed(2)}%
        (Target:
        ${target.toFixed(4)})
        `;

        detailArea.innerHTML = `
        SYMBOL:
        ${symbol}USDT

        PRICE:
        ${price.toFixed(4)}

        TARGET:
        ${target.toFixed(4)}

        5 MA:
        ${ma5[ma5.length-1]?.toFixed(4)}

        15 MA:
        ${ma15[ma15.length-1]?.toFixed(4)}

        30 MA:
        ${ma30[ma30.length-1]?.toFixed(4)}

        5 MA SLOPE:
        ${ma5slope.toFixed(4)}%

        15 MA SLOPE:
        ${ma15slope.toFixed(4)}%

        30 MA SLOPE:
        ${ma30slope.toFixed(4)}%

        FINAL PREDICT:
        ${predict.toFixed(4)}%
        `;

    }catch(e){

        console.log(e);

        priceArea.innerHTML =
        "LOAD ERROR";

        predictArea.innerHTML =
        "API FAIL";

        detailArea.innerHTML = `
        ERROR:

        ${e.message}
        `;

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

    document.getElementById(
        "updateTime"
    ).innerHTML =
    "HK UPDATE TIME : " + hk;

}

async function loadMacro(){

    const macroArea =
    document.getElementById(
        "macroArea"
    );

    if(!macroArea){

        return;

    }

    try{

        const response =
        await fetch(
            "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );

        if(!response.ok){

            throw new Error(
                "HTTP " + response.status
            );

        }

        const data =
        await response.json();

        const btcPrice =
        parseFloat(data.price);

        if(isNaN(btcPrice)){

            throw new Error(
                "BTC NaN"
            );

        }

        macroArea.innerHTML = `
        <div class="macro-title">
        BTC 宏觀方向 (4-24H)
        </div>

        <div class="macro-score">
        🟡 中性震盪
        </div>

        <div class="macro-info">
        BTC:
        ${btcPrice.toFixed(2)}
        </div>
        `;

    }catch(e){

        console.log(e);

        macroArea.innerHTML = `
        <div class="macro-title">
        BTC 宏觀方向 (4-24H)
        </div>

        <div class="macro-score">
        ❌ MACRO ERROR
        </div>

        <div class="macro-info">
        ${e.message}
        </div>
        `;

    }

}

setInterval(updateHKTime,1000);

setInterval(()=>{

    loadCoin("left");

    loadCoin("right");

},5000);

setInterval(loadMacro,10000);

updateHKTime();

loadCoin("left");

loadCoin("right");

loadMacro();
