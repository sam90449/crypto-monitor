async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data.lastPrice) {
            return null;
        }

        return {
            price: parseFloat(data.lastPrice),
            changePercent: parseFloat(data.priceChangePercent || 0),
            volume: parseFloat(data.quoteVolume || 0)
        };

    } catch (e) {

        console.log("BINANCE ERROR", e);

        return null;

    }

}

async function getKlines(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=30`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(k => ({
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
        }));

    } catch (e) {

        console.log("KLINE ERROR", e);

        return [];

    }

}

function calculateMA(data, period) {

    if (!data || data.length < period) {
        return 0;
    }

    const sliced = data.slice(-period);

    let total = 0;

    for (const item of sliced) {
        total += item.close;
    }

    return total / period;

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

        if (!response.ok) {

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

        return await response.json();

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

function getHKTime24() {

    return new Date().toLocaleString(
        "en-GB",
        {
            timeZone: "Asia/Hong_Kong",
            hour12: false
        }
    );

}

async function loadCoin(side) {

    const symbolInput =
        side === "left"
            ? document.getElementById("leftInput")
            : document.getElementById("rightInput");

    const symbolText =
        side === "left"
            ? document.getElementById("leftSymbol")
            : document.getElementById("rightSymbol");

    const priceText =
        side === "left"
            ? document.getElementById("leftPrice")
            : document.getElementById("rightPrice");

    const predictionText =
        side === "left"
            ? document.getElementById("leftPrediction")
            : document.getElementById("rightPrediction");

    const up1 =
        side === "left"
            ? document.getElementById("leftBoxes1")
            : document.getElementById("rightBoxes1");

    const up15 =
        side === "left"
            ? document.getElementById("leftBoxes15")
            : document.getElementById("rightBoxes15");

    const up2 =
        side === "left"
            ? document.getElementById("leftBoxes2")
            : document.getElementById("rightBoxes2");

    const down1 =
        side === "left"
            ? document.getElementById("leftDown1")
            : document.getElementById("rightDown1");

    const down15 =
        side === "left"
            ? document.getElementById("leftDown15")
            : document.getElementById("rightDown15");

    const down2 =
        side === "left"
            ? document.getElementById("leftDown2")
            : document.getElementById("rightDown2");

    const fear =
        side === "left"
            ? document.getElementById("leftFear")
            : document.getElementById("rightFear");

    const dxy =
        side === "left"
            ? document.getElementById("leftDxy")
            : document.getElementById("rightDxy");

    const dow =
        side === "left"
            ? document.getElementById("leftDow")
            : document.getElementById("rightDow");

    const vix =
        side === "left"
            ? document.getElementById("leftVix")
            : document.getElementById("rightVix");

    const gold =
        side === "left"
            ? document.getElementById("leftGold")
            : document.getElementById("rightGold");

    const us10y =
        side === "left"
            ? document.getElementById("leftUs10y")
            : document.getElementById("rightUs10y");

    const fearText =
        side === "left"
            ? document.getElementById("leftFearText")
            : document.getElementById("rightFearText");

    const update =
        side === "left"
            ? document.getElementById("leftUpdate")
            : document.getElementById("rightUpdate");

    const symbol =
        symbolInput.value.trim().toUpperCase();

    if (!symbol) {
        return;
    }

    symbolText.innerText = `${symbol}/USDT`;

    priceText.innerText = "Loading...";
    predictionText.innerText = "Loading...";

    const ticker = await getBinancePrice(symbol);

    if (!ticker) {

        priceText.innerText = "UNSUPPORTED";
        predictionText.innerText = "API ERROR";

        return;

    }

    if (ticker.price >= 1000) {
        priceText.innerText = ticker.price.toFixed(2);
    } else {
        priceText.innerText = ticker.price.toFixed(4);
    }

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

    predictionText.innerText = prediction.text;
    predictionText.style.color = prediction.color;

    up1.innerHTML = renderBoxes(prediction.up1, "green");
    up15.innerHTML = renderBoxes(prediction.up15, "green");
    up2.innerHTML = renderBoxes(prediction.up2, "green");

    down1.innerHTML = renderBoxes(prediction.down1, "red");
    down15.innerHTML = renderBoxes(prediction.down15, "red");
    down2.innerHTML = renderBoxes(prediction.down2, "red");

    const macro = await getMacroData();

    fear.innerText = macro.fear || "N/A";
    dxy.innerText = macro.dxy || "N/A";
    dow.innerText = macro.dow || "N/A";
    vix.innerText = macro.vix || "N/A";
    gold.innerText = macro.gold || "N/A";
    us10y.innerText = macro.us10y || "N/A";
    fearText.innerText = macro.fearText || "N/A";

    update.innerText = getHKTime24();

}

window.onload = async function () {

    const hkTime = document.getElementById("hkTime");

    if (hkTime) {
        hkTime.innerText = getHKTime24();
    }

    try {

        await loadCoin("left");

    } catch (e) {

        console.log("LEFT LOAD ERROR", e);

    }

    try {

        await loadCoin("right");

    } catch (e) {

        console.log("RIGHT LOAD ERROR", e);

    }

    const bottomLoading =
        document.getElementById("bottomLoading");

    if (bottomLoading) {
        bottomLoading.innerText = "";
    }

    setInterval(() => {

        if (hkTime) {
            hkTime.innerText = getHKTime24();
        }

    }, 1000);

};
