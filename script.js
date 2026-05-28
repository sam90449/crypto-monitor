async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`
        );

        const data = await response.json();

        if (!data || !data.lastPrice) {
            return null;
        }

        return {
            price: Number(data.lastPrice),
            changePercent: Number(data.priceChangePercent || 0),
            volume: Number(data.quoteVolume || 0)
        };

    } catch (err) {

        return null;

    }

}

async function getKlines(symbol, interval = "15m", limit = 48) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
        );

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(k => ({
            close: Number(k[4]),
            volume: Number(k[5])
        }));

    } catch (err) {

        return [];

    }

}

function calculateMA(data, period) {

    if (!data || data.length < period) {
        return 0;
    }

    const sliced = data.slice(-period);

    const sum = sliced.reduce((a, b) => a + b.close, 0);

    return sum / period;

}

function calculatePrediction(price, ma5, ma15, ma30, changePercent) {

    let score = 0;

    if (price > ma5) score++;
    else score--;

    if (price > ma15) score++;
    else score--;

    if (price > ma30) score++;
    else score--;

    if (changePercent > 1) score++;
    if (changePercent < -1) score--;

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

    } catch (err) {

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

function hkTime24() {

    return new Date().toLocaleString(
        "en-GB",
        {
            timeZone: "Asia/Hong_Kong",
            hour12: false
        }
    );

}

async function loadCoin(side) {

    const symbolInputId =
        side === "left"
            ? "leftInput"
            : "rightInput";

    const symbolTextId =
        side === "left"
            ? "leftSymbol"
            : "rightSymbol";

    const priceId =
        side === "left"
            ? "leftPrice"
            : "rightPrice";

    const predictionId =
        side === "left"
            ? "leftPrediction"
            : "rightPrediction";

    const up1Id =
        side === "left"
            ? "leftBoxes1"
            : "rightBoxes1";

    const up15Id =
        side === "left"
            ? "leftBoxes15"
            : "rightBoxes15";

    const up2Id =
        side === "left"
            ? "leftBoxes2"
            : "rightBoxes2";

    const down1Id =
        side === "left"
            ? "leftDown1"
            : "rightDown1";

    const down15Id =
        side === "left"
            ? "leftDown15"
            : "rightDown15";

    const down2Id =
        side === "left"
            ? "leftDown2"
            : "rightDown2";

    const fearId =
        side === "left"
            ? "leftFear"
            : "rightFear";

    const dxyId =
        side === "left"
            ? "leftDxy"
            : "rightDxy";

    const dowId =
        side === "left"
            ? "leftDow"
            : "rightDow";

    const vixId =
        side === "left"
            ? "leftVix"
            : "rightVix";

    const goldId =
        side === "left"
            ? "leftGold"
            : "rightGold";

    const us10yId =
        side === "left"
            ? "leftUs10y"
            : "rightUs10y";

    const fearTextId =
        side === "left"
            ? "leftFearText"
            : "rightFearText";

    const updateId =
        side === "left"
            ? "leftUpdate"
            : "rightUpdate";

    const symbol = document
        .getElementById(symbolInputId)
        .value
        .trim()
        .toUpperCase();

    if (!symbol) {
        return;
    }

    document.getElementById(symbolTextId).innerText =
        `${symbol}/USDT`;

    document.getElementById(priceId).innerText =
        "Loading...";

    document.getElementById(predictionId).innerText =
        "Loading...";

    const ticker = await getBinancePrice(symbol);

    if (!ticker) {

        document.getElementById(priceId).innerText =
            "UNSUPPORTED";

        document.getElementById(predictionId).innerText =
            "API ERROR";

        return;

    }

    document.getElementById(priceId).innerText =
        ticker.price >= 1000
            ? ticker.price.toFixed(2)
            : ticker.price.toFixed(4);

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

    const predictionEl =
        document.getElementById(predictionId);

    predictionEl.innerText =
        prediction.text;

    predictionEl.style.color =
        prediction.color;

    document.getElementById(up1Id).innerHTML =
        renderBoxes(prediction.up1, "green");

    document.getElementById(up15Id).innerHTML =
        renderBoxes(prediction.up15, "green");

    document.getElementById(up2Id).innerHTML =
        renderBoxes(prediction.up2, "green");

    document.getElementById(down1Id).innerHTML =
        renderBoxes(prediction.down1, "red");

    document.getElementById(down15Id).innerHTML =
        renderBoxes(prediction.down15, "red");

    document.getElementById(down2Id).innerHTML =
        renderBoxes(prediction.down2, "red");

    const macro = await getMacroData();

    document.getElementById(fearId).innerText =
        macro.fear || "N/A";

    document.getElementById(dxyId).innerText =
        macro.dxy || "N/A";

    document.getElementById(dowId).innerText =
        macro.dow || "N/A";

    document.getElementById(vixId).innerText =
        macro.vix || "N/A";

    document.getElementById(goldId).innerText =
        macro.gold || "N/A";

    document.getElementById(us10yId).innerText =
        macro.us10y || "N/A";

    document.getElementById(fearTextId).innerText =
        macro.fearText || "N/A";

    document.getElementById(updateId).innerText =
        hkTime24();

}

window.onload = async function () {

    document.getElementById("hkTime").innerText =
        hkTime24();

    await loadCoin("left");

    await loadCoin("right");

    const bottomLoading =
        document.getElementById("bottomLoading");

    if (bottomLoading) {
        bottomLoading.innerText = "";
    }

    setInterval(() => {

        document.getElementById("hkTime").innerText =
            hkTime24();

    }, 1000);

};
