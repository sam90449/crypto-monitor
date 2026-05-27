let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url) {

    try {

        const response = await fetch(
            `${url}?t=${Date.now()}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const text =
            await response.text();

        console.log("RAW:", text);

        return JSON.parse(text);

    } catch (e) {

        console.log("FETCH ERROR:", e);

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

    const n = parseFloat(v);

    if (isNaN(n)) {

        return (0).toFixed(d);
    }

    return n.toFixed(d);
}

function predictColor(v) {

    const n = parseFloat(v);

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
        document.getElementById(
            `${side}-card`
        );

    if (!card) {
        return;
    }

    console.log("COIN DATA:", data);

    if (!data || data.error) {

        card.innerHTML = `

<div style="
color:#ff5577;
font-size:30px;
font-weight:bold;
">
LOAD FAIL
</div>

`;

        return;
    }

    const symbol =
        data.symbol || "-";

    const price =
        num(data.price);

    const target =
        num(data.target);

    const ma5 =
        num(data.ma5);

    const ma15 =
        num(data.ma15);

    const ma30 =
        num(data.ma30);

    const ma5slope =
        num(data.ma5slope);

    const ma15slope =
        num(data.ma15slope);

    const ma30slope =
        num(data.ma30slope);

    const predict =
        num(data.predict);

    const color =
        predictColor(data.predict);

    card.innerHTML = `

<div class="coin-box">

<div style="
font-size:34px;
font-weight:bold;
margin-bottom:20px;
">
${symbol}USDT
</div>

<div>
PRICE:
${price}
</div>

<br>

<div>
TARGET:
${target}
</div>

<br>

<div>
5 MA:
${ma5}
</div>

<br>

<div>
15 MA:
${ma15}
</div>

<br>

<div>
30 MA:
${ma30}
</div>

<br>

<div>
5 MA SLOPE:
${ma5slope}%
</div>

<br>

<div>
15 MA SLOPE:
${ma15slope}%
</div>

<br>

<div>
30 MA SLOPE:
${ma30slope}%
</div>

<br>

<div style="
font-size:30px;
font-weight:bold;
color:${color};
">
FINAL PREDICT:
${predict}%
</div>

</div>

`;
}

function updateMacro(data) {

    const card =
        document.getElementById(
            "macro-card"
        );

    if (!card) {
        return;
    }

    console.log("MACRO DATA:", data);

    if (!data || data.error) {

        card.innerHTML = `

<div style="
color:#ff5577;
font-size:32px;
font-weight:bold;
">
MACRO LOAD FAIL
</div>

`;

        return;
    }

    const btc =
        num(data.btc, 2);

    const eth =
        num(data.eth, 2);

    const btcChange =
        data.btcChange || "-";

    const btcVolume =
        data.btcVolume || "-";

    const status =
        data.status || "-";

    const icon =
        data.icon || "⚪";

    const updateTime =
        data.updateTime || "-";

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
margin-bottom:30px;
">
${icon}
${status}
</div>

<div style="
font-size:30px;
margin-bottom:20px;
">
BTC:
${btc}
</div>

<div style="
font-size:30px;
margin-bottom:20px;
">
ETH:
${eth}
</div>

<div style="
font-size:30px;
margin-bottom:20px;
">
BTC 24H CHANGE:
${btcChange}
</div>

<div style="
font-size:30px;
margin-bottom:20px;
">
BTC VOLUME:
${btcVolume}
</div>

<div style="
font-size:30px;
">
HK UPDATE:
${updateTime}
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

    document.getElementById(
        "left-card"
    ).innerHTML = "Loading...";

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

    document.getElementById(
        "right-card"
    ).innerHTML = "Loading...";

    const data =
        await fetchCoin(symbol);

    rightCache = data;

    updateCoinCard(
        "right",
        data
    );
}

async function loadMacro() {

    document.getElementById(
        "macro-card"
    ).innerHTML = "Loading...";

    const data =
        await fetchMacro();

    macroCache = data;

    updateMacro(data);
}

window.onload = async function () {

    console.log("SCRIPT START");

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();
};

document
    .getElementById("left-load")
    .onclick = async function () {

        await loadLeftCoin();
    };

document
    .getElementById("right-load")
    .onclick = async function () {

        await loadRightCoin();
    };

setInterval(async function () {

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();

}, 60000);
