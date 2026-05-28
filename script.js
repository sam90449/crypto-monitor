async function getCryptoData() {

    try {

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,solana,ripple,dogecoin,binancecoin,cardano,avalanche-2,chainlink&vs_currencies=usd",
            {
                headers: {
                    "accept": "application/json"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {

            return null;

        }

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

        if (!response.ok) {

            return null;

        }

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

function getCoinPrice(symbol, cryptoData) {

    const map = {

        BTC:
            cryptoData?.bitcoin?.usd,

        ETH:
            cryptoData?.ethereum?.usd,

        TON:
            cryptoData?.["the-open-network"]?.usd,

        SOL:
            cryptoData?.solana?.usd,

        XRP:
            cryptoData?.ripple?.usd,

        DOGE:
            cryptoData?.dogecoin?.usd,

        BNB:
            cryptoData?.binancecoin?.usd,

        ADA:
            cryptoData?.cardano?.usd,

        AVAX:
            cryptoData?.["avalanche-2"]?.usd,

        LINK:
            cryptoData?.chainlink?.usd

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

    setLoading(side);

    const [
        cryptoData,
        macroData
    ] = await Promise.all([

        getCryptoData(),
        getMacroData()

    ]);

    if (!cryptoData) {

        document.getElementById(priceId).innerHTML =
            "CRYPTO API ERROR";

        return;

    }

    if (!macroData) {

        document.getElementById(priceId).innerHTML =
            "MACRO API ERROR";

        return;

    }

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
            ${macroData.status}
            ${macroData.icon}
        </div>
    `;

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

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " +
        macroData.updateTime;

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
                ${macroData.us10y}
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
