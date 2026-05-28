```javascript
const API_URL = "https://wispy-dawn-5bf8.jacky12345cheung.workers.dev/";

const btcPriceHistory = [];
const btcVolumeHistory = [];

function keepHistory(arr, value, max = 120) {
    arr.push(value);

    if (arr.length > max) {
        arr.shift();
    }
}

function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatChange(v) {
    return v > 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`;
}

function createBlocks(active, color) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        html += `
        <div class="block"
             style="
                width:22px;
                height:22px;
                margin-right:6px;
                display:inline-block;
                border:1px solid #555;
                background:${i < active ? color : '#222'};
             ">
        </div>`;
    }

    return html;
}

function drawPredictionBlocks(scoreUp, scoreDown) {

    document.getElementById("btc_up_1").innerHTML =
        createBlocks(scoreUp.one, "#00ff88");

    document.getElementById("btc_up_15").innerHTML =
        createBlocks(scoreUp.one5, "#00ff88");

    document.getElementById("btc_up_2").innerHTML =
        createBlocks(scoreUp.two, "#00ff88");

    document.getElementById("btc_down_1").innerHTML =
        createBlocks(scoreDown.one, "#ff4444");

    document.getElementById("btc_down_15").innerHTML =
        createBlocks(scoreDown.one5, "#ff4444");

    document.getElementById("btc_down_2").innerHTML =
        createBlocks(scoreDown.two, "#ff4444");

    document.getElementById("eth_up_1").innerHTML =
        createBlocks(scoreUp.one, "#00ff88");

    document.getElementById("eth_up_15").innerHTML =
        createBlocks(scoreUp.one5, "#00ff88");

    document.getElementById("eth_up_2").innerHTML =
        createBlocks(scoreUp.two, "#00ff88");

    document.getElementById("eth_down_1").innerHTML =
        createBlocks(scoreDown.one, "#ff4444");

    document.getElementById("eth_down_15").innerHTML =
        createBlocks(scoreDown.one5, "#ff4444");

    document.getElementById("eth_down_2").innerHTML =
        createBlocks(scoreDown.two, "#ff4444");
}

function getMode(score) {

    if (score <= -8) {
        return {
            text: "🚨 Major Dump Risk",
            macro: "強勢看跌",
            color: "#00ffee"
        };
    }

    if (score <= -5) {
        return {
            text: "⚠ Bearish",
            macro: "偏弱看跌",
            color: "#ff6699"
        };
    }

    if (score <= -2) {
        return {
            text: "⚠ Weak Bearish",
            macro: "中線偏弱",
            color: "#ffaa00"
        };
    }

    if (score >= 8) {
        return {
            text: "🚀 Strong Bullish",
            macro: "強勢看漲",
            color: "#00ff88"
        };
    }

    if (score >= 5) {
        return {
            text: "🟢 Bullish",
            macro: "偏強看漲",
            color: "#00ff88"
        };
    }

    return {
        text: "No Major Alert",
        macro: "中性震盪",
        color: "#ffee00"
    };
}

async function fetchKlines() {

    const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=60";

    const r = await fetch(url);

    const data = await r.json();

    return data.map(k => ({
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
    }));
}

function calcMacroScore(globalData, btcChange, ma20, lastClose) {

    let score = 0;

    if (globalData.dxy.change > 0.15) score -= 2;
    else if (globalData.dxy.change > 0.05) score -= 1;

    if (globalData.vix.change > 2) score -= 2;
    else if (globalData.vix.change > 1) score -= 1;

    if (globalData.gold.change < -1) score -= 1;

    if (globalData.us10y.change > 0.3) score -= 2;
    else if (globalData.us10y.change > 0.1) score -= 1;

    if (globalData.dow.change > 0.5) score += 2;
    else if (globalData.dow.change > 0.2) score += 1;

    if (globalData.fear.value < 25) score -= 2;
    else if (globalData.fear.value < 40) score -= 1;

    if (btcChange <= -3) score -= 3;
    else if (btcChange <= -2) score -= 2;
    else if (btcChange <= -1) score -= 1;

    if (lastClose < ma20) score -= 1;
    else score += 1;

    return score;
}

function shortTermPrediction(klines) {

    const closes = klines.map(k => k.close);

    const volumes = klines.map(k => k.volume);

    const lastClose = closes[closes.length - 1];

    const ma20 = avg(closes.slice(-20));

    const avgVolume = avg(volumes.slice(-20));

    const latestVolume = volumes[volumes.length - 1];

    let greenCount = 0;
    let redCount = 0;

    for (let i = closes.length - 6; i < closes.length; i++) {

        if (i <= 0) continue;

        if (closes[i] > closes[i - 1]) {
            greenCount++;
        }

        if (closes[i] < closes[i - 1]) {
            redCount++;
        }
    }

    let scoreUp = 0;
    let scoreDown = 0;

    if (greenCount >= 3) scoreUp += 2;

    if (redCount >= 3) scoreDown += 2;

    if (lastClose > ma20) scoreUp += 1;

    if (lastClose < ma20) scoreDown += 1;

    if (latestVolume > avgVolume * 1.5) {

        if (greenCount > redCount) {
            scoreUp += 1;
        }

        if (redCount > greenCount) {
            scoreDown += 1;
        }
    }

    return {
        scoreUp,
        scoreDown,
        ma20,
        lastClose
    };
}

function convertBlockLevel(score) {

    return {
        one: Math.min(4, Math.max(0, score)),
        one5: Math.min(4, Math.max(0, score - 1)),
        two: Math.min(4, Math.max(0, score - 2))
    };
}

async function loadData() {

    try {

        const workerResponse = await fetch(API_URL);

        const globalData = await workerResponse.json();

        const btcResponse = await fetch(
            "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
        );

        const btcData = await btcResponse.json();

        const btcPrice = parseFloat(btcData.lastPrice);

        const btcChange = parseFloat(btcData.priceChangePercent);

        const btcVolume = parseFloat(btcData.quoteVolume);

        keepHistory(btcPriceHistory, btcPrice);

        keepHistory(btcVolumeHistory, btcVolume);

        const klines = await fetchKlines();

        const shortTerm = shortTermPrediction(klines);

        const score = calcMacroScore(
            globalData,
            btcChange,
            shortTerm.ma20,
            shortTerm.lastClose
        );

        const mode = getMode(score);

        const upBlocks = convertBlockLevel(shortTerm.scoreUp);

        const downBlocks = convertBlockLevel(shortTerm.scoreDown);

        drawPredictionBlocks(upBlocks, downBlocks);

        document.getElementById("alertBox").innerText =
            mode.text;

        document.getElementById("alertBox").style.color =
            mode.color;

        document.getElementById("shortPredict").innerText =
            `短線預測 | 15m: ${(btcChange / 20).toFixed(2)}% | 30m: ${(btcChange / 10).toFixed(2)}%`;

        document.getElementById("btcPrice").innerText =
            `BTC: ${btcPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} USDT (${btcChange.toFixed(2)}%)`;

        document.getElementById("btcVolume").innerText =
            `BTC成交量: ${Math.round(btcVolume).toLocaleString()}`;

        document.getElementById("macroText").innerText =
            `● 宏觀方向：${mode.macro} | SCORE: ${score}`;

        document.getElementById("macroText").style.color =
            mode.color;

        document.getElementById("macroSub").innerText =
            "全球宏觀數據分析中...";

        document.getElementById("dxy").innerText =
            `DXY美元指數: ${globalData.dxy.value.toFixed(2)} (${formatChange(globalData.dxy.change)})`;

        document.getElementById("dow").innerText =
            `道瓊斯指數: ${globalData.dow.value.toLocaleString()} (${formatChange(globalData.dow.change)})`;

        document.getElementById("us10y").innerText =
            `美債10年期: ${globalData.us10y.value.toFixed(2)}% (${formatChange(globalData.us10y.change)})`;

        document.getElementById("vix").innerText =
            `恐慌指數(VIX): ${globalData.vix.value.toFixed(2)} (${formatChange(globalData.vix.change)})`;

        document.getElementById("gold").innerText =
            `黃金: ${globalData.gold.value.toFixed(2)} (${formatChange(globalData.gold.change)})`;

        document.getElementById("fear").innerText =
            `MARKET FEAR: ${globalData.fear.text} (${globalData.fear.value})`;

    }

    catch (e) {

        console.log(e);

        document.getElementById("alertBox").inne
```
