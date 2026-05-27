let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url, retry = 3) {

    for (let i = 0; i < retry; i++) {

        try {

            const response = await fetch(url + "?t=" + Date.now(), {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (response.ok) {
                return response;
            }

        } catch (e) {

            console.log(e);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    throw new Error("FETCH FAIL");
}

async function fetchCoin(symbol) {

    try {

        const response =
            await safeFetch(`/api/coin/${symbol}`);

        return await response.json();

    } catch (e) {

        console.log(e);

        return {
            error: e.toString()
        };
    }
}

async function fetchMacro() {

    try {

        const response =
            await safeFetch(`/api/macro`);

        return await response.json();

    } catch (e) {

        console.log(e);

        return {
            error: e.toString()
        };
    }
}

function setText(id, text) {

    const el = document.getElementById(id);

    if (el) {
        el.innerText = text;
    }
}

function predictColor(value) {

    if (value > 0) {
        return "#00ff99";
    }

    if (value < 0) {
        return "#ff5577";
    }

    return "#ffffff";
}

function buildCoinHTML(data) {

    const predict =
        Number(data.predict || 0);

    const color =
        predictColor(predict);

    return `

<div class="coin-box">

<div class="coin-symbol">
${data.symbol}USDT
</div>

<div class="coin-price">
PRICE:
${Number(data.price || 0).toFixed(4)}
</div>

<div class="coin-target">
TARGET:
${Number(data.target || 0).toFixed(4)}
</div>

<div class="coin-ma">
5 MA:
${Number(data.ma5 || 0).toFixed(4)}
</div>

<div class="coin-ma">
15 MA:
${Number(data.ma15 || 0).toFixed(4)}
</div>

<div class="coin-ma">
30 MA:
${Number(data.ma30 || 0).toFixed(4)}
</div>

<div class="coin-ma">
5 MA SLOPE:
${Number(data.ma5slope || 0).toFixed(4)}%
</div>

<div class="coin-ma">
15 MA SLOPE:
${Number(data.ma15slope || 0).toFixed(4)}%
</div>

<div class="coin-ma">
30 MA SLOPE:
${Number(data.ma30slope || 0).toFixed(4)}%
</div>

<div 
class="coin-predict"
style="color:${color}"
>
FINAL PREDICT:
${predict.toFixed(4)}%
</div>

</div>

`;
}

function updateCoinCard(side, data) {

    const card =
        document.getElementById(`${side}-card`);

    if (!card) {
        return;
    }

    if (!data || data.error) {

        card.innerHTML = `
<div style="color:#ff5577">
LOAD FAIL
</div>
`;

        return;
    }

    card.innerHTML =
        buildCoinHTML(data);
}

function updateMacro(data) {

    const card =
        document.getElementById("macro-card");

    if (!card) {
        return;
    }

    if (!data || data.error) {

        card.innerHTML = `
<div style="color:#ff5577">
MACRO LOAD FAIL
</div>
`;

        return;
    }

    card.innerHTML = `

<div class="macro-box">

<div class="macro-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-status">
${data.icon || "⚪"}
${data.status || "等待中"}
</div>

<div class="macro-item">
BTC:
${data.btc || "0"}
</div>

<div class="macro-item">
ETH:
${data.eth || "0"}
</div>

<div class="macro-item">
BTC 24H CHANGE:
${data.btcChange || "0%"}
</div>

<div class="macro-item">
BTC VOLUME:
${data.btcVolume || "0"}
</div>

<div class="macro-item">
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

document
    .getElementById("left-load")
    .addEventListener(
        "click",
        loadLeftCoin
    );

document
    .getElementById("right-load")
    .addEventListener(
        "click",
        loadRightCoin
    );

window.addEventListener("load", async () => {

    try {

        await loadLeftCoin();

        await loadRightCoin();

        await loadMacro();

    } catch (e) {

        console.log(e);
    }
});

setInterval(async () => {

    try {

        await loadLeftCoin();

        await loadRightCoin();

        await loadMacro();

    } catch (e) {

        console.log(e);
    }

}, 60000);
