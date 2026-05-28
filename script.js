async function loadCoin(side) {

    const symbol =
        document
        .getElementById(
            side + "-input"
        )
        .value
        .trim()
        .toUpperCase();

    const resultBox =
        document.getElementById(
            side + "-result"
        );

    resultBox.innerHTML =
        "Loading...";

    try {

        const response =
            await fetch(
                `/api/coin/${symbol}`
            );

        const data =
            await response.json();

        if (data.error) {

            resultBox.innerHTML =
                data.error;

            return;
        }

        resultBox.innerHTML = `

<div class="coin-title">
${data.symbol}USDT
</div>

<div class="coin-price">
PRICE:
<br>
${Number(data.price).toFixed(4)}
</div>

<br>

TARGET:
<br>
${Number(data.target).toFixed(4)}

<br><br>

5 MA:
<br>
${Number(data.ma5).toFixed(4)}

<br><br>

15 MA:
<br>
${Number(data.ma15).toFixed(4)}

<br><br>

30 MA:
<br>
${Number(data.ma30).toFixed(4)}

<br><br>

5 MA SLOPE:
<br>
${Number(data.ma5slope).toFixed(4)}%

<br><br>

15 MA SLOPE:
<br>
${Number(data.ma15slope).toFixed(4)}%

<br><br>

30 MA SLOPE:
<br>
${Number(data.ma30slope).toFixed(4)}%

<br><br>

FINAL PREDICT:
<br>
${Number(data.predict).toFixed(4)}%

<br><br>

UPDATE:
<br>
${data.updateTime}

`;

    } catch (e) {

        resultBox.innerHTML =
            "LOAD FAIL";
    }
}

document
.getElementById("left-load")
.onclick = () =>
loadCoin("left");

document
.getElementById("right-load")
.onclick = () =>
loadCoin("right");

loadCoin("left");
loadCoin("right");

async function loadMacro() {

    try {

        const response =
            await fetch(
                "/api/macro"
            );

        const data =
            await response.json();

        const box =
            document.getElementById(
                "macro-box"
            );

        box.innerHTML = `

<h2>
BTC 宏觀方向（4-24H）
</h2>

<div style="
font-size:42px;
margin-top:10px;
">
${data.icon}
</div>

<div style="
font-size:36px;
font-weight:bold;
margin-top:10px;
">
${data.status}
</div>

<br>

BTC:
${data.btc}

<br><br>

ETH:
${data.eth}

<br><br>

BTC 24H CHANGE:
${data.btcChange}

<br><br>

BTC VOLUME:
${data.btcVolume}

<br><br>

TOTAL CAP:
${data.totalCap}

<br><br>

BTC DOM:
${data.btcDom}

<br><br>

FEAR:
${data.fear}
(
${data.fearText}
)

<br><br>

HK UPDATE:
${data.updateTime}

`;
    }

    catch(e){

        document
        .getElementById(
            "macro-box"
        )
        .innerHTML =
            "MACRO LOAD FAIL";
    }
}

loadMacro();
setInterval(
    loadMacro,
    60000
);
