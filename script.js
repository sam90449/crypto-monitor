const API_URL = "https://wispy-dawn-5bf8.jacky12345cheung.workers.dev";

async function fetchGlobalData() {
    try {
        const res = await fetch(API_URL);
        return await res.json();
    } catch (e) {
        console.error(e);

        return {
            dxy: { value: 0, change: 0 },
            dow: { value: 0, change: 0 },
            us10y: { value: 0, change: 0 },
            vix: { value: 0, change: 0 },
            gold: { value: 0, change: 0 },
            fear: {
                value: 50,
                text: "Neutral"
            }
        };
    }
}

async function fetchBTC() {
    try {
        const res = await fetch(
            "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
        );

        return await res.json();

    } catch (e) {

        return {
            lastPrice: "0",
            priceChangePercent: "0",
            volume: "0"
        };
    }
}

function getFearText(v) {

    if (v <= 25) return "Extreme Fear";
    if (v <= 45) return "Fear";
    if (v <= 55) return "Neutral";
    if (v <= 75) return "Greed";

    return "Extreme Greed";
}

function calculateScore(data, btcChange) {

    let score = 0;

    if (data.dxy.change > 0) score -= 1;
    else score += 1;

    if (data.vix.change > 0) score -= 1;
    else score += 1;

    if (data.gold.change > 0) score -= 1;
    else score += 1;

    if (data.us10y.change > 0) score -= 1;
    else score += 1;

    if (data.dow.change > 0) score += 1;
    else score -= 1;

    if (data.fear.value <= 25) score -= 2;
    else if (data.fear.value >= 75) score += 2;

    if (btcChange > 0) score += 1;
    else score -= 1;

    return score;
}

function getDirection(score) {

    if (score >= 5) {
        return {
            emoji: "🟢",
            text: "強勢看漲",
            color: "#00ff88",
            risk: "Strong Pump"
        };
    }

    if (score >= 2) {
        return {
            emoji: "🟡",
            text: "偏強看漲",
            color: "#00ffee",
            risk: "Bullish"
        };
    }

    if (score >= -1) {
        return {
            emoji: "🟡",
            text: "中性震盪",
            color: "#ffee00",
            risk: "No Major Alert"
        };
    }

    if (score >= -4) {
        return {
            emoji: "🔴",
            text: "偏弱看跌",
            color: "#ff5577",
            risk: "Bearish"
        };
    }

    return {
        emoji: "🔴",
        text: "強勢看跌",
        color: "#ff3344",
        risk: "Major Dump Risk"
    };
}

function createBlocks(count) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        if (i < count) {
            html += `<div class="block active"></div>`;
        } else {
            html += `<div class="block"></div>`;
        }
    }

    return html;
}

function updatePredictionBoxes(score) {

    let up1 = 0;
    let up15 = 0;
    let up2 = 0;

    let down1 = 0;
    let down15 = 0;
    let down2 = 0;

    if (score >= 5) {
        up1 = 4;
        up15 = 4;
        up2 = 4;
    }
    else if (score >= 2) {
        up1 = 3;
        up15 = 2;
        up2 = 1;
    }
    else if (score >= -1) {
        up1 = 1;
        down1 = 1;
    }
    else if (score >= -4) {
        down1 = 2;
        down15 = 3;
        down2 = 2;
    }
    else {
        down1 = 1;
        down15 = 2;
        down2 = 3;
    }

    document.getElementById("up1").innerHTML = createBlocks(up1);
    document.getElementById("up15").innerHTML = createBlocks(up15);
    document.getElementById("up2").innerHTML = createBlocks(up2);

    document.getElementById("down1").innerHTML = createBlocks(down1);
    document.getElementById("down15").innerHTML = createBlocks(down15);
    document.getElementById("down2").innerHTML = createBlocks(down2);
}

async function loadData() {

    const globalData = await fetchGlobalData();

    const btc = await fetchBTC();

    const btcPrice = parseFloat(btc.lastPrice);

    const btcChange = parseFloat(btc.priceChangePercent);

    const btcVolume = parseFloat(btc.volume);

    const score = calculateScore(globalData, btcChange);

    const direction = getDirection(score);

    document.getElementById("riskText").innerText =
        `⚠ ${direction.risk}`;

    document.getElementById("btcPrice").innerText =
        `BTC: ${btcPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} USDT (${btcChange.toFixed(2)}%)`;

    document.getElementById("btcVolume").innerText =
        `BTC成交量: ${Math.round(btcVolume).toLocaleString()}`;

    document.getElementById("macroDirection").innerHTML =
        `${direction.emoji} 宏觀方向：${direction.text} | SCORE: ${score}`;

    document.getElementById("macroDirection").style.color =
        direction.color;

    document.getElementById("dxy").innerText =
        `DXY美元指數: ${globalData.dxy.value.toFixed(2)} (${globalData.dxy.change.toFixed(2)}%)`;

    document.getElementById("dow").innerText =
        `道瓊斯指數: ${globalData.dow.value.toLocaleString()} (${globalData.dow.change.toFixed(2)}%)`;

    document.getElementById("us10y").innerText =
        `美債10年期: ${globalData.us10y.value.toFixed(2)}% (${globalData.us10y.change.toFixed(2)}%)`;

    document.getElementById("vix").innerText =
        `恐慌指數(VIX): ${globalData.vix.value.toFixed(2)} (${globalData.vix.change.toFixed(2)}%)`;

    document.getElementById("gold").innerText =
        `黃金: ${globalData.gold.value.toFixed(2)} (${globalData.gold.change.toFixed(2)}%)`;

    document.getElementById("fear").innerText =
        `MARKET FEAR: ${globalData.fear.text} (${globalData.fear.value})`;

    updatePredictionBoxes(score);

    const short15 = (btcChange / 18).toFixed(2);

    const short30 = (btcChange / 9).toFixed(2);

    document.getElementById("shortPredict").innerText =
        `短線預測 | 15m: ${short15}% | 30m: ${short30}%`;
}

loadData();

setInterval(loadData, 15000);
