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

function setLoading(side) {

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

    document.getElementById(priceId).innerHTML =
        "Loading...";

    document.getElementById(predictionId).innerHTML =
        "Loading...";

    document.getElementById(boxesId).innerHTML =
        "";

    document.getElementById(infoId).innerHTML =
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

    const data = await getMacroData();

    if (data.error) {

        document.getElementById(priceId).innerHTML =
            "API ERROR";

        document.getElementById(predictionId).innerHTML =
            data.error;

        return;

    }

    let coinPrice =
        data.coins?.[symbol] || "UNSUPPORTED";

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
            ${data.status} ${data.icon}
        </div>
    `;

    document.getElementById(boxesId).innerHTML = `
        <div class="mini-box">
            <div class="mini-title">
                FEAR
            </div>

            <div class="mini-value">
                ${data.fear}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC DOM
            </div>

            <div class="mini-value">
                ${data.btcDom}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC CHANGE
            </div>

            <div class="mini-value">
                ${data.btcChange}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                VOLUME
            </div>

            <div class="mini-value">
                ${data.btcVolume}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                TOTAL CAP
            </div>

            <div class="mini-value">
                ${data.totalCap}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                UPDATE
            </div>

            <div class="mini-value">
                ${data.updateTime}
            </div>
        </div>
    `;

    document.getElementById(infoId).innerHTML = `
        <div class="global-line">
            FEAR:
            ${data.fear}
            (${data.fearText})
        </div>

        <div class="global-line">
            BTC DOM:
            ${data.btcDom}
        </div>

        <div class="global-line">
            TOTAL CAP:
            ${data.totalCap}
        </div>

        <div class="global-line">
            BTC VOL:
            ${data.btcVolume}
        </div>
    `;

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " + data.updateTime;

    document.getElementById("macroArea").innerHTML = `

        <div class="macro-title">
            GLOBAL MACRO DATA
        </div>

        <div class="macro-content">

            <div class="global-line">
                DXY:
                ${data.dxy}
                (${data.dxyChange})
            </div>

            <div class="global-line">
                DOW:
                ${data.dow}
                (${data.dowChange})
            </div>

            <div class="global-line">
                VIX:
                ${data.vix}
                (${data.vixChange})
            </div>

            <div class="global-line">
                GOLD:
                ${data.gold}
                (${data.goldChange})
            </div>

            <div class="global-line">
                US10Y:
                ${data.us10y}
                (${data.us10yChange})
            </div>

            <br>

            <div class="global-line">
                TOTAL MARKET CAP:
                ${data.totalCap}
            </div>

            <div class="global-line">
                BTC DOMINANCE:
                ${data.btcDom}
            </div>

            <div class="global-line">
                BTC VOLUME:
                ${data.btcVolume}
            </div>

            <div class="global-line">
                FEAR & GREED:
                ${data.fear}
                (${data.fearText})
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
