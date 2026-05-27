let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url, retry = 3) {

    for (let i = 0; i < retry; i++) {

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

            const text = await response.text();

            try {

                return JSON.parse(text);

            } catch (e) {

                console.log("JSON PARSE ERROR:", text);

                throw e;
            }

        } catch (e) {

            console.log("FETCH ERROR:", e);

            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return {
        error: "FETCH FAIL"
    };
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
${data.symbol || "-"}USDT
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
<div style="
color:#ff5577;
font-size:24px;
">
LOAD FAIL
</div>
`;

        console.log("COIN ERROR:", data);

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
<div style="
color:#ff5577;
font-size:24px;
">
MACRO LOAD FAIL
</div>
`;

        console.log("MACRO ERROR:", data);

        return;
    }

    card.innerHTML = `

<div class="macro-box">

<div class="macro-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-status">
${data.icon || "⚪"}
${data.status || "-"}
</div>

<div class="macro-item">
BTC:
${data.btc || "-"}
</div>

<div class="macro-item">
ETH:
${data.eth || "-"}
</div>

<div class="macro-item">
BTC 24H CHANGE:
${data.btcChange || "-"}
</div>

<div class="macro-item">
BTC VOLUME:
${data.btcVolume || "-"}
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

    const card =
        document.getElementById("left-card");

    card.innerHTML = "Loading...";

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

    const card =
        document.getElementById("right-card");

    card.innerHTML = "Loading...";

    const data =
        await fetchCoin(symbol);

    rightCache = data;

    updateCoinCard(
        "right",
        data
    );
}

async function loadMacro() {

    const card =
        document.getElementById("macro-card");

    card.innerHTML = "Loading...";

    const data =
        await fetchMacro();

    macroCache = data;

    updateMacro(data);
}

document
    .getElementById("left-load")
    .addEventListener(
        "click",
        async () => {

            await loadLeftCoin();
        }
    );

document
    .getElementById("right-load")
    .addEventListener(
        "click",
        async () => {

            await loadRightCoin();
        }
    );

window.onload = async function () {

    console.log("SCRIPT START");

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();
};

setInterval(async () => {

    await loadLeftCoin();

    await loadRightCoin();

    await loadMacro();

}, 60000);
