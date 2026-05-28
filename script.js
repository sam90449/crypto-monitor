async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.price) {

            return "UNSUPPORTED";

        }

        const price = Number(data.price);

        if (
            symbol === "XRP" ||
            symbol === "DOGE" ||
            symbol === "ADA" ||
            symbol === "BABY"
        ) {

            return price.toFixed(4);

        }

        return price.toFixed(2);

    } catch (e) {

        return "N/A";

    }

}

async function getMacroData() {

    try {

        const response = await fetch(
            "/api/macro?t=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        return data;

    } catch (error) {

        return {
            error: error.toString()
        };

    }

}

async function getKlines(symbol, interval = "5m", limit = 30) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`,
            {
                cache: "no-store"
            }
        );

        return await response.json();

    } catch (e) {

        return [];

    }

}

function calculateMA(klines, period) {

    if (!klines || klines.length < period) {

        return null;

    }

    const closes = klines.map(
        k => Number(k[4])
    );

    const sliced = closes.slice(-period);

    const sum = sliced.reduce(
        (a, b) => a + b,
        0
    );

    return sum / period;

}

function calculateScore(
    price,
    ma5,
    ma15,
    ma30,
    macroData
) {

    let score = 0;

    // =========================
    // PRICE VS MA
    // =========================

    if (price > ma5) {

        score += 1;

    } else {

        score -= 1;

    }

    // =========================
    // MA STRUCTURE
    // =========================

    if (ma5 > ma15) {

        score += 1;

    } else {

        score -= 1;

    }

    if (ma15 > ma30) {

        score += 1;

    } else {

        score -= 1;

    }

    // =========================
    // DXY
    // =========================

    const dxyChange =
        parseFloat(
            String(
                macroData.dxyChange || "0"
            ).replace("%", "")
        );

    if (dxyChange < 0) {

        score += 1;

    } else {

        score -= 1;

    }

    // =========================
    // VIX
    // =========================

    const vixChange =
        parseFloat(
            String(
                macroData.vixChange || "0"
            ).replace("%", "")
        );

    if (vixChange < 0) {

        score += 1;

    } else {

        score -= 1;

    }

    return score;

}

function getPredictionText(score) {

    if (score >= 4) {

        return "高勝算率偏多";

    }

    if (score >= 2) {

        return "中等偏多";

    }

    if (score >= 1) {

        return "低勝算率";

    }

    if (score <= -4) {

        return "高風險偏空";

    }

    if (score <= -2) {

        return "中等偏空";

    }

    return "中性震盪";

}

function renderColorBoxes(count, color) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        html += `
            <div
                class="small-box ${i < count ? color : ""}"
            ></div>
        `;

    }

    return html;

}

function renderBoxes(score) {

    let green = 0;
    let red = 0;

    if (score >= 4) {

        green = 4;

    } else if (score >= 2) {

        green = 3;

    } else if (score >= 1) {

        green = 2;

    }

    if (score <= -4) {

        red = 4;

    } else if (score <= -2) {

        red = 3;

    } else if (score <= -1) {

        red = 2;

    }

    return `

        <div class="box-grid">

            <div class="box-row">

                <div class="box-label green-text">
                    ▲1%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(green, "green")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label red-text">
                    ▼1%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(red, "red")}
                </div>

            </div>

        </div>

    `;

}

async function loadCoin(side) {

    const inputId =
        side === "left"
            ? "leftInput"
            : "rightInput";

    const priceId =
        side === "left"
            ? "leftPrice"
            : "rightPrice";

    const predictionId =
        side === "left"
            ? "leftPrediction"
            : "rightPrediction";

    const boxesId =
        side === "left"
            ? "leftBoxes"
            : "rightBoxes";

    const infoId =
        side === "left"
            ? "leftInfo"
            : "rightInfo";

    const symbol =
        document
            .getElementById(inputId)
            .value
            .trim()
            .toUpperCase();

    document.getElementById(priceId).innerHTML =
        "Loading...";

    document.getElementById(predictionId).innerHTML =
        "Loading...";

    document.getElementById(boxesId).innerHTML =
        "";

    document.getElementById(infoId).innerHTML =
        "Loading...";

    // =====================================
    // BINANCE PRICE
    // =====================================

    const coinPrice =
        await getBinancePrice(symbol);

    // =====================================
    // MACRO DATA
    // =====================================

    const macroData =
        await getMacroData();

    // =====================================
    // KLINES
    // =====================================

    const klines =
        await getKlines(symbol);

    const price =
        parseFloat(coinPrice);

    const ma5 =
        calculateMA(klines, 5);

    const ma15 =
        calculateMA(klines, 15);

    const ma30 =
        calculateMA(klines, 30);

    const score =
        calculateScore(
            price,
            ma5,
            ma15,
            ma30,
            macroData
        );

    const predictionText =
        getPredictionText(score);

    // =====================================
    // PRICE
    // =====================================

    document.getElementById(priceId).innerHTML = `

        <div class="coin-symbol">
            ${symbol}/USDT
        </div>

        <div class="coin-value">
            ${coinPrice}
        </div>

    `;

    // =====================================
    // PREDICTION
    // =====================================

    document.getElementById(predictionId).innerHTML = `

        <div class="prediction-title">
            1-3H AI PREDICTION
        </div>

        <div class="prediction-status">
            ${predictionText}
            ${macroData.icon || "🟣"}
        </div>

    `;

    // =====================================
    // BOXES
    // =====================================

    document.getElementById(boxesId).innerHTML =
        renderBoxes(score);

    // =====================================
    // INFO
    // =====================================

    document.getElementById(infoId).innerHTML = `

        <div class="global-line">
            FEAR:
            ${macroData.fear || "N/A"}
        </div>

        <div class="global-line">
            BTC DOM:
            ${macroData.btcDom || "N/A"}
        </div>

        <div class="global-line">
            BTC CHANGE:
            ${macroData.btcChange || "N/A"}
        </div>

        <div class="global-line">
            BTC VOL:
            ${macroData.btcVolume || "N/A"}
        </div>

        <div class="global-line">
            MA5:
            ${ma5 ? ma5.toFixed(2) : "N/A"}
        </div>

        <div class="global-line">
            MA15:
            ${ma15 ? ma15.toFixed(2) : "N/A"}
        </div>

        <div class="global-line">
            MA30:
            ${ma30 ? ma30.toFixed(2) : "N/A"}
        </div>

        <div class="global-line">
            SCORE:
            ${score}
        </div>

    `;

    // =====================================
    // UPDATE TIME
    // =====================================

    document.getElementById("updateTime").innerHTML =

        "HK UPDATE TIME: " +
        (macroData.updateTime || "N/A");

    // =====================================
    // GLOBAL MACRO
    // =====================================

    document.getElementById("macroArea").innerHTML = `

        <div class="macro-title">
            GLOBAL MACRO DATA
        </div>

        <div class="macro-content">

            <div class="global-line">
                DXY:
                ${macroData.dxy || "N/A"}
                (${macroData.dxyChange || "N/A"})
            </div>

            <div class="global-line">
                DOW:
                ${macroData.dow || "N/A"}
                (${macroData.dowChange || "N/A"})
            </div>

            <div class="global-line">
                VIX:
                ${macroData.vix || "N/A"}
                (${macroData.vixChange || "N/A"})
            </div>

            <div class="global-line">
                GOLD:
                ${macroData.gold || "N/A"}
                (${macroData.goldChange || "N/A"})
            </div>

            <div class="global-line">
                US10Y:
                ${macroData.us10y || "N/A"}
                (${macroData.us10yChange || "N/A"})
            </div>

        </div>

    `;

}

window.onload = function () {

    loadCoin("left");

    loadCoin("right");

    setInterval(function () {

        loadCoin("left");

        loadCoin("right");

    }, 30000);

};
