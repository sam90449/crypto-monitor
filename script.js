async function loadCoin(side) {

    const symbol =
        document
        .getElementById(side + "-input")
        .value
        .trim()
        .toUpperCase();

    const resultBox =
        document.getElementById(side + "-result");

    resultBox.innerHTML = "Loading...";

    try {

        const response =
            await fetch("/api/macro");

        const data =
            await response.json();

        if (data.error) {

            resultBox.innerHTML =
                data.error;

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
VOLUME:
<br>
${data.btcVolume}
</div>

<br>

<div class="coin-info">
MARKET STATUS:
<br>
${data.icon} ${data.status}
</div>

<br>

<div class="coin-info">
FEAR INDEX:
<br>
${data.fear}
(${data.fearText})
</div>

<br>

<div class="coin-info">
UPDATE:
<br>
${data.updateTime}
</div>

`;

    } catch (e) {

        resultBox.innerHTML =
            "LOAD FAILED<br><br>" + e;
    }
}

loadCoin("left");
loadCoin("right");

setInterval(() => {

    loadCoin("left");
    loadCoin("right");

}, 30000);
