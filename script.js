async function loadCoin(side) {
    const symbol = document
        .getElementById(side + "-input")
        .value
        .trim()
        .toUpperCase();

    const resultBox = document.getElementById(side + "-result");

    resultBox.innerHTML = "Loading...";

    try {
        const response = await fetch("/api/macro");
        const data = await response.json();

        if (data.error) {
            resultBox.innerHTML = data.error;
            return;
        }

        let coinPrice = "N/A";

        if (symbol === "BTC") {
            coinPrice = data.btc;
        } else if (symbol === "ETH") {
            coinPrice = data.eth;
        } else {
            coinPrice = "UNSUPPORTED";
        }

        resultBox.innerHTML = `
            <div class="coin-title">
                ${symbol}/USDT
            </div>

            <div class="coin-price">
                PRICE:
                <br>
                ${coinPrice}
            </div>

            <br>

            <div class="coin-info">
                24H CHANGE:
                <br>
                ${data.btcChange}
            </div>

            <br>

            <div class="coin-info">
                MARKET FEAR:
                <br>
                ${data.fearText}
            </div>

            <br>

            <div class="coin-info">
                MARKET STATUS:
                <br>
                ${data.status} ${data.icon}
            </div>

            <br>

            <div class="coin-update">
                UPDATE:
                <br>
                ${data.updateTime}
            </div>
        `;
    } catch (err) {
        resultBox.innerHTML = `
            <div style="color:red;">
                LOAD ERROR
                <br><br>
                ${err}
            </div>
        `;
    }
}

window.onload = function () {
    loadCoin("left");
    loadCoin("right");
};
