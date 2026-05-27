async function getKlines(symbol){

    const url =
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`;

    const response =
    await fetch(url);

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

    return (last-first)/Math.abs(first);

}

function fillBoxes(side,percent){

    const boxes =
    document.querySelectorAll(`.${side}-box`);

    boxes.forEach(x=>{
        x.classList.remove("red-fill");
    });

    let level = 0;

    if(percent >= 2){
        level = 4;
    }
    else if(percent >= 1.5){
        level = 3;
    }
    else if(percent >= 1){
        level = 2;
    }

    for(let i=0;i<level;i++){

        if(boxes[i]){
            boxes[i].classList.add("red-fill");
        }

    }

}

async function loadCoin(side){

    let symbol = "";

    if(side === "left"){
        symbol =
        document.getElementById("leftInput")
        .value
        .trim()
        .toUpperCase();
    }
    else{
        symbol =
        document.getElementById("rightInput")
        .value
        .trim()
        .toUpperCase();
    }

    if(symbol === ""){
        return;
    }

    try{

        const klines =
        await getKlines(symbol);

        const closes =
        klines
        .slice(0,-1)
        .map(k=>parseFloat(k[4]));

        const volumes =
        klines
        .slice(0,-1)
        .map(k=>parseFloat(k[5]));

        const price =
        closes[closes.length-1];

        const ma5 =
        closes.slice(-5)
        .reduce((a,b)=>a+b,0)/5;

        const ma15 =
        closes.slice(-15)
        .reduce((a,b)=>a+b,0)/15;

        const ma30 =
        closes.slice(-30)
        .reduce((a,b)=>a+b,0)/30;

        const ma20 =
        calcMA(closes,20)
        .filter(x=>x!==null);

        let recent = 13;
        let previous = 13;

        if(symbol === "BTC"){
            recent = 8;
        }

        const recentMA =
        ma20.slice(-recent);

        const previousMA =
        ma20.slice(-(recent+previous),-recent);

        const A =
        slope(recentMA);

        const B =
        slope(previousMA);

        const absA =
        Math.abs(A);

        const absB =
        Math.abs(B);

        let ratio = 999;

        if(absB !== 0){
            ratio =
            absA/absB;
        }

        const rawPredict =
        ((ma5-ma30)/ma30)*100;

        let multiplier = 1;

        if(ratio >= 1.1 && ratio <= 2.6){
            multiplier = 0.2;
        }
        else if(ratio >= 2.7 && ratio <= 3.6){
            multiplier = 0.4;
        }
        else if(ratio >= 3.7 && ratio <= 4.1){
            multiplier = 0.8;
        }
        else if(ratio >= 4.1){
            multiplier = 1;
        }

        let finalPercent =
        rawPredict * multiplier;

        let sign = "+";

        if((A-B) < 0){
            sign = "-";
            finalPercent =
            -Math.abs(finalPercent);
        }
        else{
            finalPercent =
            Math.abs(finalPercent);
        }

        const target =
        price*(1+finalPercent/100);

        let predictionText =
        `1-3H Prediction : ${sign}${Math.abs(finalPercent).toFixed(2)}% (Target: ${target.toFixed(4)})`;

        if(ratio <= 1){

            predictionText =
            "1-3H Prediction : 低勝算率";

            finalPercent = 0;

        }

        if(ratio >= 4.7){

            predictionText =
            `1-3H Prediction : 極高勝算率 ${sign}${Math.abs(finalPercent).toFixed(2)}%`;

        }

        if(side === "left"){

            document.getElementById("leftPrice")
            .innerHTML =
            `${symbol}USDT : ${price.toFixed(4)}`;

            document.getElementById("leftPrediction")
            .innerHTML =
            predictionText;

            document.getElementById("leftInfo")
            .innerHTML =

`SYMBOL : ${symbol}USDT

PRICE :
${price.toFixed(4)}

5 MA :
${ma5.toFixed(4)}

15 MA :
${ma15.toFixed(4)}

30 MA :
${ma30.toFixed(4)}

LATEST VOLUME :
${parseInt(volumes[volumes.length-1]).toLocaleString()}

AVG VOLUME :
${parseInt(
volumes.slice(-20)
.reduce((a,b)=>a+b,0)/20
).toLocaleString()}

A SLOPE :
${A.toFixed(6)}

B SLOPE :
${B.toFixed(6)}

RATIO :
${ratio.toFixed(2)}

RAW PREDICT :
${rawPredict.toFixed(4)}%

FINAL PREDICT :
${finalPercent.toFixed(4)}%
`;

            fillBoxes(
            "left",
            Math.abs(finalPercent)
            );

        }
        else{

            document.getElementById("rightPrice")
            .innerHTML =
            `${symbol}USDT : ${price.toFixed(4)}`;

            document.getElementById("rightPrediction")
            .innerHTML =
            predictionText;

            document.getElementById("rightInfo")
            .innerHTML =

`SYMBOL : ${symbol}USDT

PRICE :
${price.toFixed(4)}

5 MA :
${ma5.toFixed(4)}

15 MA :
${ma15.toFixed(4)}

30 MA :
${ma30.toFixed(4)}

LATEST VOLUME :
${parseInt(volumes[volumes.length-1]).toLocaleString()}

AVG VOLUME :
${parseInt(
volumes.slice(-20)
.reduce((a,b)=>a+b,0)/20
).toLocaleString()}

A SLOPE :
${A.toFixed(6)}

B SLOPE :
${B.toFixed(6)}

RATIO :
${ratio.toFixed(2)}

RAW PREDICT :
${rawPredict.toFixed(4)}%

FINAL PREDICT :
${finalPercent.toFixed(4)}%
`;

            fillBoxes(
            "right",
            Math.abs(finalPercent)
            );

        }

        const now =
        new Date();

        const hk =
        now.toLocaleString(
        "en-US",
        {
            timeZone:"Asia/Hong_Kong"
        }
        );

        document.getElementById("updateTime")
        .innerHTML =
        "HK UPDATE TIME : " + hk;

    }
    catch(err){

        alert(
        symbol + " LOAD FAILED"
        );

    }

}

setInterval(()=>{

    loadCoin("left");
    loadCoin("right");

},180000);
