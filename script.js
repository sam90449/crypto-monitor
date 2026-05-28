async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data || !data.price) {
            return null;
        }

        return {
            price: parseFloat(data.price)
        };

    } catch (e) {

        console.log("BINANCE PRICE ERROR:", e);

        return null;

    }

}

async function get24hData(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {

            return {
                changePercent: 0,
                volume: 0
            };

        }

        const data = await response.json();

        return {
            changePercent: parseFloat(data.priceChangePercent || 0),
            volume: parseFloat(data.quoteVolume || 0)
        };

    } catch (e) {

        console.log("24H ERROR:", e);

        return {
            changePercent: 0,
            volume: 0
        };

    }

}

async function getKlines(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=30`,
            {
                cache: "no-store"
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
            close: parseFloat(k[4])
        }));

    } catch (e) {

        console.log("KLINE ERROR:", e);

        return [];

    }

}

function calculateMA(data, period) {

    if (!data || data.length < period) {
        return 0;
    }

    let total = 0;

    for (let i = data.length - period; i < data.length; i++) {
        total += data[i].close;
    }

    return total / period;

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

        const response = await fetch(
            "/api/macro",
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {

            return {
                fear: "N/A",
                dxy: "N/A",
                dow: "N/A",
                vix: "N/A",
                gold: "N/A",
                us10y: "N/A",
                fearText: "N/A"
            };

        }

        return await response.json();

    } catch (e) {

        console.log("MACRO ERROR:", e);

        return {
            fear: "N/A",
            dxy: "N/A",
            dow: "N/A",
            vix: "N/A",
            gold: "N/A",
            us10y: "N/A",
            fearText: "N/A"
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

    const symbol =
        symbolInput.value.trim().toUpperCase();

    if (!symbol) {
        return;
    }

    symbolText.innerText =
        `${symbol}/USDT`;

    priceText.innerText = "Loading...";
    predictionText.innerText = "Loading...";

    const priceData =
        await getBinancePrice(symbol);

    if (!priceData) {

        priceText.innerText = "UNSUPPORTED";
        predictionText.innerText = "API ERROR";

        return;

    }

    const extraData =
        await get24hData(symbol);

    const klines =
        await getKlines(symbol);

    const ma5 =
        calculateMA(klines, 5);

    const ma15 =
        calculateMA(klines, 15);

    const ma30 =
        calculateMA(klines, 30);

    const prediction =
        calculatePrediction(
            priceData.price,
            ma5,
            ma15,
            ma30,
            extraData.changePercent
        );

    if (priceData.price >= 1000) {
        priceText.innerText =
            priceData.price.toFixed(2);
    } else {
        priceText.innerText =
            priceData.price.toFixed(4);
    }

    predictionText.innerText =
        prediction.text;

    predictionText.style.color =
        prediction.color;

    document.getElementById(
        side === "left"
            ? "leftBoxes1"
            : "rightBoxes1"
    ).innerHTML =
        renderBoxes(prediction.up1, "green");

    document.getElementById(
        side === "left"
            ? "leftBoxes15"
            : "rightBoxes15"
    ).innerHTML =
        renderBoxes(prediction.up15, "green");

    document.getElementById(
        side === "left"
            ? "leftBoxes2"
            : "rightBoxes2"
    ).innerHTML =
        renderBoxes(prediction.up2, "green");

    document.getElementById(
        side === "left"
            ? "leftDown1"
            : "rightDown1"
    ).innerHTML =
        renderBoxes(prediction.down1, "red");

    document.getElementById(
        side === "left"
            ? "leftDown15"
            : "rightDown15"
    ).innerHTML =
        renderBoxes(prediction.down15, "red");

    document.getElementById(
        side === "left"
            ? "leftDown2"
            : "rightDown2"
    ).innerHTML =
        renderBoxes(prediction.down2, "red");

    const macro =
        await getMacroData();

    document.getElementById(
        side === "left"
            ? "leftFear"
            : "rightFear"
    ).innerText =
        macro.fear || "N/A";

    document.getElementById(
        side === "left"
            ? "leftDxy"
            : "rightDxy"
    ).innerText =
        macro.dxy || "N/A";

    document.getElementById(
        side === "left"
            ? "leftDow"
            : "rightDow"
    ).innerText =
        macro.dow || "N/A";

    document.getElementById(
        side === "left"
            ? "leftVix"
            : "rightVix"
    ).innerText =
        macro.vix || "N/A";

    document.getElementById(
        side === "left"
            ? "leftGold"
            : "rightGold"
    ).innerText =
        macro.gold || "N/A";

    document.getElementById(
        side === "left"
            ? "leftUs10y"
            : "rightUs10y"
    ).innerText =
        macro.us10y || "N/A";

    document.getElementById(
        side === "left"
            ? "leftFearText"
            : "rightFearText"
    ).innerText =
        macro.fearText || "N/A";

    document.getElementById(
        side === "left"
            ? "leftUpdate"
            : "rightUpdate"
    ).innerText =
        getHKTime24();

}

window.onload = async function () {

    const hkTime =
        document.getElementById("hkTime");

    if (hkTime) {
        hkTime.innerText =
            getHKTime24();
    }

    try {

        await loadCoin("left");

    } catch (e) {

        console.log("LEFT LOAD ERROR:", e);

    }

    try {

        await loadCoin("right");

    } catch (e) {

        console.log("RIGHT LOAD ERROR:", e);

    }

    const loading =
        document.getElementById("bottomLoading");

    if (loading) {
        loading.innerText = "";
    }

    setInterval(() => {

        if (hkTime) {
            hkTime.innerText =
                getHKTime24();
        }

    }, 1000);

};
