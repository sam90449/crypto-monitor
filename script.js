async function getKlines(symbol){

    const url =
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`;

    const response = await fetch(url);

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

    const first = values[0];
    const last = values[values.length-1];

    if(first === 0){
        return 0;
    }

    return ((last-first)/first)*100;
}

function createBoxes(percent){

    let html = "";

    for(let i=0;i<4;i++){

        html += `
        <div class="predict-box
        ${i < percent ? 'active' : ''}">
        </div>
        `;
    }

    return html;
}

function createRow(label,count,isUp){

    return `
    <div class="
    predict-row
    ${isUp ? 'up-row' : 'down-row'}
    ">

        <div class="
        predict-label
        ${isUp ? 'up' : 'down'}
        ">

        ${isUp ? '▲' : '▼'}${label}

        </div>

        <div class="predict-boxes">

        ${createBoxes(count)}

        </div>

    </div>
    `;
}

function renderPredict(percent,id){

    const abs = Math.abs(percent);

    let html = "";

    if(percent >= 0){

        html += createRow("1%",abs >= 1 ? 1 : 0,true);
        html += createRow("1.5%",abs >= 1.5 ? 2 : 0,true);
        html += createRow("2%",abs >= 2 ? 3 : 0,true);

        html += createRow("1%",0,false);
        html += createRow("1.5%",0,false);
        html += createRow("2%",0,false);

    }else{

        html += createRow("1%",0,true);
        html += createRow("1.5%",0,true);
        html += createRow("2%",0,true);

        html += createRow("1%",abs >= 1 ? 1 : 0,false);
        html += createRow("1.5%",abs >= 1.5 ? 2 : 0,false);
        html += createRow("2%",abs >= 2 ? 3 : 0,false);
    }

    document.getElementById(id).innerHTML = html;
}

async function loadCoin(side){

    const input =
    document.getElementById(`${side}Input`);

    const symbol =
    input.value.toUpperCase();

    const priceArea =
    document.getElementById(`${side}Price`);

    const predictArea =
    document.getElementById(`${side}Predict`);

    const detailArea =
    document.getElementById(`${side}Detail`);

    const boxArea =
    document.getElementById(`${side}Boxes`);

    try{

        const klines =
        await getKlines(symbol);

        const closes =
        klines.map(k=>parseFloat(k[4]));

        const price =
        closes[closes.length-1];

        const ma5 =
        calcMA(closes,5);

        const ma15 =
        calcMA(closes,15);

        const ma30 =
        calcMA(closes,30);

        const ma5slope =
        slope(ma5.slice(-5));

        const ma15slope =
        slope(ma15.slice(-5));

        const ma30slope =
        slope(ma30.slice(-5));

        let predict =
        (
            ma5slope*0.5 +
            ma15slope*0.3 +
            ma30slope*0.2
        );

        if(predict > 2){
            predict = 2;
        }

        if(predict < -2){
            predict = -2;
        }

        const target =
        price * (1 + predict/100);

        priceArea.innerHTML =
        `${symbol}USDT : ${price.toFixed(4)}`;

        renderPredict(
            predict,
            `${side}Boxes`
        );

        let predictText = "";

        if(Math.abs(predict) < 0.08){

            predictText =
            "低勝算率";

        }else{

            predictText =
            `${predict.toFixed(2)}%
            (Target:
            ${target.toFixed(4)})`;
        }

        predictArea.innerHTML =
        `1-3H Prediction :
        ${predictText}`;

        detailArea.innerHTML =
`
SYMBOL:
${symbol}USDT

PRICE:
${price.toFixed(4)}

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

        priceArea.innerHTML =
        "LOAD ERROR";

        predictArea.innerHTML =
        "";

        detailArea.innerHTML =
        e;
    }
}

function updateHKTime(){

    const now = new Date();

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

    try{

        const btc =
        await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );

        const btcJson =
        await btc.json();

        const btcPrice =
        parseFloat(btcJson.price);

        const area =
        document.getElementById("macroArea");

        area.innerHTML =
`
<div class="macro-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-score">
🟡 宏觀方向：
中性震盪
|
SCORE:
-1
</div>

<div class="macro-info">
BTC現價:
${btcPrice.toFixed(2)}
USDT
</div>

<div class="macro-info">
美元指數(DXY):
99.08
(-0.09%)
</div>

<div class="macro-info">
道瓊斯:
50628
(+0.33%)
</div>

<div class="macro-info">
美債10年期:
4.5%
</div>

<div class="macro-info">
VIX恐慌指數:
16.99
</div>

<div class="macro-info">
黃金:
4455
</div>
`;

    }catch(e){

        console.log(e);
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
