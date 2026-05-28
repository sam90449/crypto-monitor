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

    document.getElementById(priceId).innerHTML = "Loading...";
    document.getElementById(predictionId).innerHTML = "Loading...";
    document.getElementById(boxesId).innerHTML = "";
    document.getElementById(infoId).innerHTML = "Loading...";

    try {

        const response =
            await fetch("/api/macro");

        const data =
            await response.json();

        let coinPrice = "N/A";

        if (symbol === "BTC") {
            coinPrice = data.btc;
        }
        else if (symbol === "ETH") {
            coinPrice = data.eth;
        }
        else {
            coinPrice = "UNSUPPORTED";
        }

        document.getElementById(priceId).innerHTML =
            `
            <div class="coin-price">
                ${symbol}/USDT
                <br><br>
                ${coinPrice}
            </div>
            `;

        document.getElementById(predictionId).innerHTML =
            `
            1-3H AI PREDICTION:
            <br><br>
            ${data.status}
            ${data.icon}
            `;

        document.getElementById(boxesId).innerHTML =
            `
            <div class="predict-box">
                FEAR:
                <br>
                ${data.fear}
            </div>

            <div class="predict-box">
                BTC DOM:
                <br>
                ${data.btcDom}
            </div>

            <div class="predict-box">
                VOLUME:
                <br>
                ${data.btcVolume}
            </div>
            `;

        document.getElementById(infoId).innerHTML =
            `
            BTC CHANGE:
            ${data.btcChange}
            <br><br>

            FEAR TEXT:
            ${data.fearText}
            <br><br>

            UPDATE:
            ${data.updateTime}
            `;

        document.getElementById("updateTime").innerHTML =
            "HK UPDATE TIME: " + data.updateTime;

        document.getElementById("macroArea").innerHTML =
            `
            TOTAL MARKET CAP:
            ${data.totalCap}
            <br><br>

            BTC DOMINANCE:
            ${data.btcDom}
            <br><br>

            MARKET FEAR:
            ${data.fearText}
            `;
    }
    catch (error) {

        document.getElementById(priceId).innerHTML =
            "LOAD FAILED";

        document.getElementById(predictionId).innerHTML =
            error.toString();
    }
}

window.onload = function () {

    loadCoin("left");

    loadCoin("right");
};
