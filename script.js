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
            symbol === "ADA"
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

        return await response.json();

    } catch (e) {

        return {};

    }

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

    // =========================================
    // BINANCE PRICE
    // =========================================

    const coinPrice =
        await getBinancePrice(symbol);

    // =========================================
    // MACRO DATA
    // =========================================

    const macroData =
        await getMacroData();

    // =========================================
    // PRICE
    // =========================================

    document.getElementById(priceId).innerHTML = `
        <div class="coin-symbol">
            ${symbol}/USDT
        </div>

        <div class="coin-value">
            ${coinPrice}
        </div>
    `;

    // =========================================
    // PREDICTION
    // =========================================

    document.getElementById(predictionId).innerHTML = `
        <div class="prediction-title">
            1-3H AI PREDICTION
        </div>

        <div class="prediction-status">
            ${macroData.status || "中性震盪"}
            ${macroData.icon || "🟣"}
        </div>
    `;

    // =========================================
    // BOXES
    // =========================================

    document.getElementById(boxesId).innerHTML = `
        <div class="mini-box">
            <div class="mini-title">
                FEAR
            </div>

            <div class="mini-value">
                ${macroData.fear || "N/A"}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC DOM
            </div>

            <div class="mini-value">
                ${macroData.btcDom || "N/A"}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC CHANGE
            </div>

            <div class="mini-value">
                ${macroData.btcChange || "N/A"}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                VOLUME
            </div>

            <div class="mini-value">
                ${macroData.btcVolume || "N/A"}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                TOTAL CAP
            </div>

            <div class="mini-value">
                ${macroData.totalCap || "N/A"}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                UPDATE
            </div>

            <div class="mini-value">
                ${macroData.updateTime || "N/A"}
            </div>
        </div>
    `;

    // =========================================
    // INFO
    // =========================================

    document.getElementById(infoId).innerHTML = `
        <div class="global-line">
            FEAR:
            ${macroData.fear || "N/A"}
            (${macroData.fearText || "N/A"})
        </div>

        <div class="global-line">
            BTC DOM:
            ${macroData.btcDom || "N/A"}
        </div>

        <div class="global-line">
            TOTAL CAP:
            ${macroData.totalCap || "N/A"}
        </div>

        <div class="global-line">
            BTC VOL:
            ${macroData.btcVolume || "N/A"}
        </div>
    `;

    // =========================================
    // UPDATE TIME
    // =========================================

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " +
        (macroData.updateTime || "N/A");

    // =========================================
    // MACRO AREA
    // =========================================

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
