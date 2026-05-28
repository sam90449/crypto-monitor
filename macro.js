async function getMacroData() {

    try {

        const response = await fetch("/api/macro");

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

    let coinPrice = "UNSUPPORTED";

    if (symbol === "BTC") {

        coinPrice = data.btc;

    } else if (symbol === "ETH") {

        coinPrice = data.eth;

    }

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
            1-3H AI PREDICTION:
        </div>

        <div class="prediction-status">
            ${data.status} ${data.icon}
        </div>
    `;

    document.getElementById(boxesId).innerHTML = `
        <div class="mini-box">
            <div class="mini-title">
                FEAR:
            </div>

            <div class="mini-value">
                ${data.fear}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC DOM:
            </div>

            <div class="mini-value">
                ${data.btcDom}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                VOLUME:
            </div>

            <div class="mini-value">
                ${data.btcVolume}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                BTC CHANGE:
            </div>

            <div class="mini-value">
                ${data.btcChange}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                FEAR TEXT:
            </div>

            <div class="mini-value">
                ${data.fearText}
            </div>
        </div>

        <div class="mini-box">
            <div class="mini-title">
                UPDATE:
            </div>

            <div class="mini-value">
                ${data.updateTime}
            </div>
        </div>
    `;

    document.getElementById(infoId).innerHTML = `
        <div class="global-line">
            TOTAL MARKET CAP:
            ${data.totalCap}
        </div>

        <div class="global-line">
            BTC DOMINANCE:
            ${data.btcDom}
        </div>

        <div class="global-line">
            MARKET FEAR:
            ${data.fearText}
        </div>
    `;

    document.getElementById("updateTime").innerHTML =
        "HK UPDATE TIME: " + data.updateTime;

}

window.onload = function () {

    loadCoin("left");

    loadCoin("right");

};
