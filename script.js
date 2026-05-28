const BINANCE_URL = "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT";

const FEAR_API = "https://api.alternative.me/fng/";

const YAHOO_PROXY = "https://query1.finance.yahoo.com/v8/finance/chart/";

const SYMBOLS = {
    DXY: "DX-Y.NYB",
    DOW: "^DJI",
    VIX: "^VIX",
    GOLD: "GC=F",
    US10Y: "^TNX"
};

function createCells(targetId, filled, colorClass){

    const box = document.getElementById(targetId);

    box.innerHTML = "";

    for(let i=0;i<4;i++){

        const cell = document.createElement("div");

        cell.className = "cell";

        if(i < filled){

            cell.classList.add(colorClass);
        }

        box.appendChild(cell);
    }
}

function updatePredictionGrid(score){

    createCells("btc_up_1",0,"fill-green");
    createCells("btc_up_15",0,"fill-green");
    createCells("btc_up_2",0,"fill-green");

    createCells("btc_down_1",0,"fill-red");
    createCells("btc_down_15",0,"fill-red");
    createCells("btc_down_2",0,"fill-red");

    createCells("dow_up_1",0,"fill-green");
    createCells("dow_up_15",0,"fill-green");
    createCells("dow_up_2",0,"fill-green");

    createCells("dow_down_1",0,"fill-red");
    createCells("dow_down_15",0,"fill-red");
    createCells("dow_down_2",0,"fill-red");

    if(score >= 5){

        createCells("btc_up_1",1,"fill-green");
        createCells("btc_up_15",2,"fill-green");
        createCells("btc_up_2",3,"fill-green");

    }else if(score >= 2){

        createCells("btc_up_1",1,"fill-green");

    }else if(score <= -5){

        createCells("btc_down_1",1,"fill-red");
        createCells("btc_down_15",2,"fill-red");
        createCells("btc_down_2",3,"fill-red");

    }else if(score <= -2){

        createCells("btc_down_1",1,"fill-red");
    }
}

async function fetchYahoo(symbol){

    try{

        const response = await fetch(
            `${YAHOO_PROXY}${symbol}?interval=1d&range=2d`
        );

        const data = await response.json();

        const result = data.chart.result[0];

        const price = result.meta.regularMarketPrice;

        const previous = result.meta.chartPreviousClose;

        const change = ((price - previous) / previous) * 100;

        return {
            price,
            change
        };

    }catch(e){

        return {
            price:0,
            change:0
        };
    }
}

async function fetchFear(){

    try{

        const response = await fetch(FEAR_API);

        const data = await response.json();

        return parseInt(data.data[0].value);

    }catch(e){

        return 50;
    }
}

async function fetchBTC(){

    const response = await fetch(BINANCE_URL);

    const data = await response.json();

    return {
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.quoteVolume),
        change: parseFloat(data.priceChangePercent)
    };
}

function marketFearText(v){

    if(v <= 25) return "Extreme Fear";
    if(v <= 45) return "Fear";
    if(v <= 55) return "Neutral";
    if(v <= 75) return "Greed";

    return "Extreme Greed";
}

function buildMacro(score){

    if(score >= 5){

        return {
            text:"🟢 宏觀方向：強勢看漲 | SCORE: "+score,
            reason:"美元偏弱｜風險市場強勢"
        };
    }

    if(score >= 2){

        return {
            text:"🟡 宏觀方向：偏強看漲 | SCORE: "+score,
            reason:"市場氣氛偏向風險資產"
        };
    }

    if(score <= -5){

        return {
            text:"🔴 宏觀方向：強勢看跌 | SCORE: "+score,
            reason:"避險情緒極強｜BTC偏弱"
        };
    }

    if(score <= -2){

        return {
            text:"🟠 宏觀方向：偏弱看跌 | SCORE: "+score,
            reason:"美債偏強｜BTC中線偏弱"
        };
    }

    return {
        text:"🟡 宏觀方向：中性震盪 | SCORE: "+score,
        reason:"市場方向未明"
    };
}

async function loadData(){

    try{

        const btc = await fetchBTC();

        const dxy = await fetchYahoo(SYMBOLS.DXY);

        const dow = await fetchYahoo(SYMBOLS.DOW);

        const vix = await fetchYahoo(SYMBOLS.VIX);

        const gold = await fetchYahoo(SYMBOLS.GOLD);

        const us10y = await fetchYahoo(SYMBOLS.US10Y);

        const fear = await fetchFear();

        let score = 0;

        if(dxy.change < 0) score += 1;
        else score -= 1;

        if(dow.change > 0) score += 1;
        else score -= 1;

        if(vix.change < 0) score += 1;
        else score -= 1;

        if(gold.change < 0) score += 1;
        else score -= 1;

        if(us10y.change < 0) score += 1;
        else score -= 1;

        if(fear > 55) score += 1;
        else if(fear < 45) score -= 1;

        const macro = buildMacro(score);

        updatePredictionGrid(score);

        document.getElementById("majorAlert").innerHTML =
            score <= -5
            ? "⚠ Major Dump Risk"
            : score >= 5
            ? "🚀 Strong Bullish Momentum"
            : "No Major Alert";

        document.getElementById("shortPredict").innerHTML =
            `短線預測 | 15m: ${(btc.change/18).toFixed(2)}% | 30m: ${(btc.change/9).toFixed(2)}%`;

        document.getElementById("btcPrice").innerHTML =
            `BTC: ${btc.price.toLocaleString()} USDT (${btc.change.toFixed(2)}%)`;

        document.getElementById("btcVolume").innerHTML =
            `BTC成交量: ${Math.round(btc.volume).toLocaleString()}`;

        document.getElementById("macroDirection").innerHTML =
            macro.text;

        document.getElementById("macroReason").innerHTML =
            macro.reason;

        document.getElementById("dxyData").innerHTML =
            `DXY美元指數: ${dxy.price.toFixed(2)} (${dxy.change.toFixed(2)}%)`;

        document.getElementById("dowData").innerHTML =
            `道瓊斯指數: ${dow.price.toLocaleString()} (${dow.change.toFixed(2)}%)`;

        document.getElementById("us10yData").innerHTML =
            `美債10年期: ${us10y.price.toFixed(2)}% (${us10y.change.toFixed(2)}%)`;

        document.getElementById("vixData").innerHTML =
            `恐慌指數(VIX): ${vix.price.toFixed(2)} (${vix.change.toFixed(2)}%)`;

        document.getElementById("goldData").innerHTML =
            `黃金: ${gold.price.toFixed(2)} (${gold.change.toFixed(2)}%)`;

        document.getElementById("fearData").innerHTML =
            `MARKET FEAR: ${marketFearText(fear)} (${fear})`;

    }catch(e){

        console.log(e);

        document.getElementById("majorAlert").innerHTML =
            "LOAD ERROR";
    }
}

loadData();

setInterval(loadData,30000);
