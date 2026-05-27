let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url) {

    try {

        const response = await fetch(
            `${url}?t=${Date.now()}`,
            {
                method: "GET"
            }
        );

        if (!response.ok) {

            return {
                error: "HTTP ERROR"
            };
        }

        return await response.json();

    } catch (e) {

        console.log(e);

        return {
            error: e.toString()
        };
    }
}

async function fetchCoin(symbol) {

    return await safeFetch(
        `/api/coin/${symbol}`
    );
}

async function fetchMacro() {

    return await safeFetch(
        `/api/macro`
    );
}

function num(v, d = 4) {

    const n = Number(v);

    if (isNaN(n)) {
        return "0.0000";
    }

    return n.toFixed(d);
}

function predictColor(value) {

    const n = Number(value);

    if (n > 0) {
        return "#00ff99";
    }

    if (n < 0) {
        return "#ff5577";
    }

    return "#ffffff";
}

function updateCoinCard(side, data) {

    const card =
        document.getElementById(`${side}-card`);

    if (!card) {
        return;
    }

    if (!data || data.error) {

        card.innerHTML = `

<div style="
color:#ff5577;
font-size:28px;
font-weight:bold;
">
LOAD FAIL
</div>

`;

        console.log(data);

        return;
    }

    const predict =
        Number(data.predict || 0);

    const color =
        predictColor(predict);

    card.innerHTML = `

<div class="coin-box">

<div class="coin-symbol">
${data.symbol || "-"}USDT
</div>

<br>

<div>
PRICE:
${num(data.price)}
</div>

<br>

<div>
TARGET:
${num(data.target)}
</div>

<br>

<div>
5 MA:
${num(data.ma5)}
</div>

<br>

<div>
15 MA:
${num(data.ma15)}
</div>

<br>

<div>
30 MA:
${num(data.ma30)}
</div>

<br>

<div>
5 MA SLOPE:
${num(data.ma5slope)}%
</div>

<br>

<div>
15 MA SLOPE:
${num(data.ma15slope)}%
</div>

<br>

<div>
30 MA SLOPE:
${num(data.ma30slope)}%
</div>

<br>

<div style="
color:${color};
font-size:26px;
font-weight:bold;
">
FINAL PREDICT:
${num(predict)}%
</div>

</div>

`;
}

function updateMacro(data) {

    const card =
        document.getElementById("macro-card");

    if (!card) {
        return;
    }

    if (!data || data.error) {

        card.innerHTML = `

<div style="
color:#ff5577;
font-size:28px;
font-weight:bold;
">
MACRO LOAD FAIL
</div>

`;

        console.log(data);

        return;
    }

    card.innerHTML = `

<div class="macro-box">

<div style="
font-size:40px;
font-weight:bold;
margin-bottom:25px;
">
BTC 宏觀方向（4-24H）
</div>

<div style="
font-size:36px;
margin-bottom:25px;
">
${data.icon || "⚪"}
${data.status || "-"}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
BTC:
${num(data.btc,2)}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
ETH:
${num(data.eth,2)}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
BTC 24H CHANGE:
${data.btcChange || "-"}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
BTC VOLUME:
${data.btcVolume || "-"}
</div>

<div style="
font-size:30px;
">
HK UPDATE:
${data.updateTime || "-"}
</div>

</div>

`;
}

async function loadLeftCoin() {

    const symbol =
        document
            .getElementById("left-input")
            .value
            .trim()
            .toUpperCase();

    document.getElementById("left-card").innerHTML =
        "Loading...";

    const data =
        await fetchCoin(symbol);

    leftCache = data;

    updateCoinCard(
        "left",
        data
    );
}

async function loadRightCoin() {

    const symbol =
        document
            .getElementById("right-input")
            .value
            .trim()
            .toUpperCase();

    document.getElementById("right-card").innerHTML =
        "Loading...";

    const data =
        await fetchCoin(symbol);

    rightCache = data;

    updateCoinCard(
        "right",
        data
    );
}

async function loadMacro() {

    document.getElementById("macro-card").innerHTML =
        "Loading...";

    const data =
        await fetchMacro();

    macroCache = data;

    updateMacro(data);
}

window.onload = async () => {

    console.log("START");

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();
};

document
    .getElementById("left-load")
    .onclick = async () => {

        await loadLeftCoin();
    };

document
    .getElementById("right-load")
    .onclick = async () => {

        await loadRightCoin();
    };

setInterval(async () => {

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();

}, 60000);
