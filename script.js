async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.lastPrice) {
            return null;
        }

        return {
            price: Number(data.lastPrice),
            changePercent: Number(data.priceChangePercent),
            volume: Number(data.quoteVolume)
        };

    } catch (e) {

        return null;

    }

}

async function getKlines(symbol, interval = "15m", limit = 48) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        return data.map(k => ({
            close: Number(k[4]),
            volume: Number(k[5])
        }));

    } catch (e) {

        return [];

    }

}

function calculateMA(data, period) {

    if (data.length < period) {
        return 0;
    }

    const sliced = data.slice(-period);

    const sum = sliced.reduce((a, b) => a + b.close, 0);

    return sum / period;

}

function calculatePrediction(price, ma5, ma15, ma30, changePercent) {

    let score = 0;

    if (price > ma5) score += 1;
    else score -= 1;

    if (price > ma15) score += 1;
    else score -= 1;

    if (price > ma30) score += 1;
    else score -= 1;

    if (changePercent > 1) score += 1;
    if (changePercent < -1) score -= 1;

    if (score >= 4) {
        return {
            text: "強烈看漲 🚀",
            color: "#00ff95",
            up1: 4,
            up15: 4,
            up2: 3,
            down1: 0,
            down15: 0,
            down2: 0
        };
    }

    if (score >= 2) {
        return {
            text: "偏向上升 📈",
            color: "#00e5ff",
            up1: 3,
            up15: 2,
            up2: 2,
            down1: 1,
            down15: 0,
            down2: 0
        };
    }

    if (score <= -4) {
        return {
            text: "強烈看跌 📉",
            color: "#ff4d4f",
            up1: 0,
            up15: 0,
            up2: 0,
            down1: 4,
            down15: 4,
            down2: 3
        };
    }

    if (score <= -2) {
        return {
            text: "偏向下跌 ⚠️",
            color: "#ff7a7a",
            up1: 1,
            up15: 0,
            up2: 0,
            down1: 3,
            down15: 2,
            down2: 2
        };
    }

    return {
        text: "中性震盪 🟣",
        color: "#b388ff",
        up1: 1,
        up15: 1,
        up2: 0,
        down1: 1,
        down15: 1,
        down2: 0
    };

}

async function getMacroData() {

    try {

        const response = await fetch("/api/macro");

        const data = await response.json();

        return data;

    } catch (e) {

        return {
            fear: "N/A",
            dxy: "N/A",
            dow: "N/A",
            vix: "N/A",
            gold: "N/A",
            us10y: "N/A",
            fearText: "N/A",
            updateTime: "N/A"
        };

    }

}

function renderBoxes(count, type) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        if (i < count) {

            html += `<div class="small-box ${type}"></div>`;

        } else {

            html += `<div class="small-box"></div>`;

        }

    }

    return html;

}

function hkTime24h() {

    const now = new Date();

    return now.toLocaleString("en-GB", {
        timeZone: "Asia/Hong_Kong",
        hour12: false
    });

}

async function loadCoin(side) {

    const inputId = side === "left"
        ? "leftInput"
        : "rightInput";

    const symbolId = side === "left"
        ? "leftSymbol"
        : "rightSymbol";

    const priceId = side === "left"
        ? "leftPrice"
        : "rightPrice";

    const predictionId = side === "left"
        ? "leftPrediction"
        : "rightPrediction";

    const boxes1Id = side === "left"
        ? "leftBoxes1"
        : "rightBoxes1";

    const boxes15Id = side === "left"
        ? "leftBoxes15"
        : "rightBoxes15";

    const boxes2Id = side === "left"
        ? "leftBoxes2"
        : "rightBoxes2";

    const down1Id = side === "left"
        ? "leftDown1"
        : "rightDown1";

    const down15Id = side === "left"
        ? "leftDown15"
        : "rightDown15";

    const down2Id = side === "left"
        ? "leftDown2"
        : "rightDown2";

    const macroFearId = side === "left"
        ? "leftFear"
        : "rightFear";

    const macroDxyId = side === "left"
        ? "leftDxy"
        : "rightDxy";

    const macroDowId = side === "left"
        ? "leftDow"
        : "rightDow";

    const macroVixId = side === "left"
        ? "leftVix"
        : "rightVix";

    const macroGoldId = side === "left"
        ? "leftGold"
        : "rightGold";

    const macroUs10yId = side === "left"
        ? "leftUs10y"
        : "rightUs10y";

    const macroFearTextId = side === "left"
        ? "leftFearText"
        : "rightFearText";

    const macroUpdateId = side === "left"
        ? "leftUpdate"
        : "rightUpdate";

    const symbol = document
        .getElementById(inputId)
        .value
        .trim()
        .toUpperCase();

    if (!symbol) {
        return;
    }

    document.getElementById(symbolId).innerText = `${symbol}/USDT`;

    document.getElementById(priceId).innerText = "Loading...";

    const ticker = await getBinancePrice(symbol);

    if (!ticker) {

        document.getElementById(priceId).innerText = "UNSUPPORTED";

        return;

    }

    document.getElementById(priceId).innerText =
        ticker.price.toFixed(
            ticker.price >= 1000 ? 2 : 4
        );

    const klines = await getKlines(symbol);

    const ma5 = calculateMA(klines, 5);

    const ma15 = calculateMA(klines, 15);

    const ma30 = calculateMA(klines, 30);

    const prediction = calculatePrediction(
        ticker.price,
        ma5,
        ma15,
        ma30,
        ticker.changePercent
    );

    const predictionEl = document.getElementById(predictionId);

    predictionEl.innerText = prediction.text;

    predictionEl.style.color = prediction.color;

    document.getElementById(boxes1Id).innerHTML =
        renderBoxes(prediction.up1, "green");

    document.getElementById(boxes15Id).innerHTML =
        renderBoxes(prediction.up15, "green");

    document.getElementById(boxes2Id).innerHTML =
        renderBoxes(prediction.up2, "green");

    document.getElementById(down1Id).innerHTML =
        renderBoxes(prediction.down1, "red");

    document.getElementById(down15Id).innerHTML =
        renderBoxes(prediction.down15, "red");

    document.getElementById(down2Id).innerHTML =
        renderBoxes(prediction.down2, "red");

    const macro = await getMacroData();

    document.getElementById(macroFearId).innerText = macro.fear;
    document.getElementById(macroDxyId).innerText = macro.dxy;
    document.getElementById(macroDowId).innerText = macro.dow;
    document.getElementById(macroVixId).innerText = macro.vix;
    document.getElementById(macroGoldId).innerText = macro.gold;
    document.getElementById(macroUs10yId).innerText = macro.us10y;
    document.getElementById(macroFearTextId).innerText = macro.fearText;
    document.getElementById(macroUpdateId).innerText = hkTime24h();

}

window.onload = async function () {

    document.getElementById("hkTime").innerText =
        hkTime24h();

    await loadCoin("left");

    await loadCoin("right");

    document.getElementById("bottomLoading").innerText = "";

    setInterval(() => {

        document.getElementById("hkTime").innerText =
            hkTime24h();

    }, 1000);

};
