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

        return null;

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

        return null;

    }

}

function setLoading(side) {

    const priceId =
        side === "left"
            ? "leftPrice"
            : "rightPrice";

    document.getElementById(priceId).innerHTML =
        "Loading...";

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

    setLoading(side);

    // =========================
    // GET CRYPTO DATA
    // =========================

    const cryptoData =
        await getCryptoData();

    // =========================
    // GET MACRO DATA
    // =========================

    const macroData =
        await getMacroData();

    if (!cryptoData || !macroData) {

        document.getElementById(priceId).innerHTML =
            "API ERROR";

        return;

    }

    // =========================
    // MAP SYMBOL
    // =========================

    let coinPrice = "UNSUPPORTED";

    if (symbol === "BTC") {

        coinPrice =
            cryptoData?.bitcoin?.usd !== undefined
                ? Number(
                    cryptoData.bitcoin.usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "ETH") {

        coinPrice =
            cryptoData?.ethereum?.usd !== undefined
                ? Number(
                    cryptoData.ethereum.usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "TON") {

        coinPrice =
            cryptoData?.["the-open-network"]?.usd !== undefined
                ? Number(
                    cryptoData["the-open-network"].usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "SOL") {

        coinPrice =
            cryptoData?.solana?.usd !== undefined
                ? Number(
                    cryptoData.solana.usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "XRP") {

        coinPrice =
            cryptoData?.ripple?.usd !== undefined
                ? Number(
                    cryptoData.ripple.usd
                ).toFixed(4)
                : "N/A";

    } else if (symbol === "DOGE") {

        coinPrice =
            cryptoData?.dogecoin?.usd !== undefined
                ? Number(
                    cryptoData.dogecoin.usd
                ).toFixed(4)
                : "N/A";

    } else if (symbol === "BNB") {

        coinPrice =
            cryptoData?.binancecoin?.usd !== undefined
                ? Number(
                    cryptoData.binancecoin.usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "ADA") {

        coinPrice =
            cryptoData?.cardano?.usd !== undefined
                ? Number(
                    cryptoData.cardano.usd
                ).toFixed(4)
                : "N/A";

    } else if (symbol === "AVAX") {

        coinPrice =
            cryptoData?.["avalanche-2"]?.usd !== undefined
                ? Number(
                    cryptoData["avalanche-2"].usd
                ).toFixed(2)
                : "N/A";

    } else if (symbol === "LINK") {

        coinPrice =
            cryptoData?.chainlink?.usd !== undefined
                ? Number(
                    cryptoData.chainlink.usd
                ).toFixed(2)
                : "N/A";

    }

    // =========================
    // PRICE
    // =========================

    document.getElementById(priceId).innerHTML = `
        <div class="coin-symbol">
            ${symbol}/USDT
        </div>

        <div class="coin-value">
            ${coinPrice}
        </div>
    `;

    // =========================
    // PREDICTION
    // =========================

    document.getElementById(predictionId).innerHTML = `
        <div class="prediction-title">
            1-3H AI PREDICTION
        </div>

        <div class="prediction-status">
            ${macroData.status}
            ${macroData.icon}
        </div>
    `;

    // =========================
    // BOXES
    // =========================

    document.getElementById(boxesId).innerHTML = `
        <div class="mini-box">
            <div class="mini-title">
                FEAR
            </div>

            <div class="mini-value">
                ${macroData.fear}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC DOM
            </div>

            <div class="mini-value">
                ${macroData.btcDom}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC CHANGE
            </div>

            <div class="mini-value">
                ${macroData.btcChange}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                VOLUME
            </div>

            <div class="mini-value">
                ${macroData.btcVolume}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                TOTAL CAP
            </div>

            <div class="mini-value">
                ${macroData.totalCap}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                UPDATE
            </div>

            <div class="mini-value">
                ${macroData.updateTime}
            </div>
        </div>
    `;

    // =========================
    // INFO
    // =========================

    document.getElementById(infoId).innerHTML = `
        <div class="global-line">
            FEAR:
            ${macroData.fear}
            (${macroData.fearText})
        </div>

        <div class="global-line">
            BTC DOM:
            ${macroData.btcDom}
        </div>

        <div class="global-line">
            TOTAL CAP:
            ${macroData.totalCap}
        </div>

        <div class="global-line">
            BTC VOL:
            ${macroData.btcVolume}
        </div>
    `;

    // =========================
    // UPDATE TIME
    // =========================

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " +
        macroData.updateTime;

    // =========================
    // MACRO AREA
    // =========================

    document.getElementById("macroArea").innerHTML = `

        <div class="macro-title">
            GLOBAL MACRO DATA
        </div>

        <div class="macro-content">

            <div class="global-line">
                DXY:
                ${macroData.dxy}
                (${macroData.dxyChange})
            </div>

            <div class="global-line">
                DOW:
                ${macroData.dow}
                (${macroData.dowChange})
            </div>

            <div class="global-line">
                VIX:
                ${macroData.vix}
                (${macroData.vixChange})
            </div>

            <div class="global-line">
                GOLD:
                ${macroData.gold}
                (${macroData.goldChange})
            </div>

            <div class="global-line">
                US10Y:
                ${Number(macroData.us10y).toFixed(2)}
                (${macroData.us10yChange})
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
