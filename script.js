async function getCryptoData() {

    try {

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,solana,ripple,dogecoin,binancecoin,cardano,avalanche-2,chainlink&vs_currencies=usd",
            {
                cache: "no-store"
            }
        );

        return await response.json();

    } catch (e) {

        return {};

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

function getCoinPrice(symbol, data) {

    const map = {

        BTC:
            data?.bitcoin?.usd,

        ETH:
            data?.ethereum?.usd,

        TON:
            data?.["the-open-network"]?.usd,

        SOL:
            data?.solana?.usd,

        XRP:
            data?.ripple?.usd,

        DOGE:
            data?.dogecoin?.usd,

        BNB:
            data?.binancecoin?.usd,

        ADA:
            data?.cardano?.usd,

        AVAX:
            data?.["avalanche-2"]?.usd,

        LINK:
            data?.chainlink?.usd

    };

    if (map[symbol] === undefined) {

        return "UNSUPPORTED";

    }

    if (
        symbol === "XRP" ||
        symbol === "DOGE" ||
        symbol === "ADA"
    ) {

        return Number(
            map[symbol]
        ).toFixed(4);

    }

    return Number(
        map[symbol]
    ).toFixed(2);

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

    const cryptoData =
        await getCryptoData();

    const macroData =
        await getMacroData();

    const coinPrice =
        getCoinPrice(
            symbol,
            cryptoData
        );

    document.getElementById(priceId).innerHTML = `
        <div class="coin-symbol">
            ${symbol}/USDT
        </div>

        <div class="coin-value">
            ${coinPrice}
        </div>
    `;

    document.getElementById(predictionId).innerHTML = `
        <div class="prediction-title">
            1-3H AI PREDICTION
        </div>

        <div class="prediction-status">
            ${macroData.status || "中性震盪"}
            ${macroData.icon || "🟣"}
        </div>
    `;

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

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " +
        (macroData.updateTime || "N/A");

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
