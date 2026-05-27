let leftCache = null;
let rightCache = null;
let macroCache = null;

function getEl(id) {

    return document.getElementById(id);
}

async function fetchJson(url) {

    try {

        const response = await fetch(
            `${url}?t=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const text =
            await response.text();

        console.log(url);
        console.log(text);

        return JSON.parse(text);

    } catch (e) {

        console.log(e);

        return {
            error: e.toString()
        };
    }
}

function toNum(v, d = 4) {

    const n =
        parseFloat(v);

    if (isNaN(n)) {

        return (0).toFixed(d);
    }

    return n.toFixed(d);
}

function predictColor(v) {

    const n =
        parseFloat(v);

    if (n > 0) {
        return "#00ff99";
    }

    if (n < 0) {
        return "#ff5577";
    }

    return "#ffffff";
}

function buildCoinHTML(data) {

    const predict =
        parseFloat(data.predict || 0);

    return `

<div style="
font-size:34px;
font-weight:bold;
margin-bottom:20px;
">
${data.symbol || "-"}USDT
</div>

<div>
PRICE:
${toNum(data.price)}
</div>

<br>

<div>
TARGET:
${toNum(data.target)}
</div>

<br>

<div>
5 MA:
${toNum(data.ma5)}
</div>

<br>

<div>
15 MA:
${toNum(data.ma15)}
</div>

<br>

<div>
30 MA:
${toNum(data.ma30)}
</div>

<br>

<div>
5 MA SLOPE:
${toNum(data.ma5slope)}%
</div>

<br>

<div>
15 MA SLOPE:
${toNum(data.ma15slope)}%
</div>

<br>

<div>
30 MA SLOPE:
${toNum(data.ma30slope)}%
</div>

<br>

<div style="
font-size:28px;
font-weight:bold;
color:${predictColor(predict)};
">
FINAL PREDICT:
${toNum(predict)}%
</div>

`;
}

function updateCoin(side, data) {

    const card =
        getEl(`${side}-card`);

    if (!card) {
        return;
    }

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

    card.innerHTML =
        buildCoinHTML(data);
}

function updateMacro(data) {

    const card =
        getEl("macro-card");

    if (!card) {
        return;
    }

    if (!data || data.error) {

        card.innerHTML = `

<div style="
color:#ff5577;
font-size:30px;
font-weight:bold;
">
MACRO LOAD FAIL
</div>

`;

        return;
    }

    card.innerHTML = `

<div style="
font-size:42px;
font-weight:bold;
margin-bottom:25px;
">
BTC 宏觀方向（4-24H）
</div>

<div style="
font-size:38px;
margin-bottom:30px;
">
${data.icon || "⚪"}
${data.status || "-"}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
BTC:
${toNum(data.btc,2)}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
ETH:
${toNum(data.eth,2)}
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

`;
}

async function loadLeft() {

    const symbol =
        getEl("left-input")
        .value
        .trim()
        .toUpperCase();

    getEl("left-card").innerHTML =
        "Loading...";

    const data =
        await fetchJson(
            `/api/coin/${symbol}`
        );

    leftCache = data;

    updateCoin(
        "left",
        data
    );
}

async function loadRight() {

    const symbol =
        getEl("right-input")
        .value
        .trim()
        .toUpperCase();

    getEl("right-card").innerHTML =
        "Loading...";

    const data =
        await fetchJson(
            `/api/coin/${symbol}`
        );

    rightCache = data;

    updateCoin(
        "right",
        data
    );
}

async function loadMacro() {

    getEl("macro-card").innerHTML =
        "Loading...";

    const data =
        await fetchJson(
            `/api/macro`
        );

    macroCache = data;

    updateMacro(data);
}

window.onload = async () => {

    console.log("START");

    if (getEl("left-load")) {

        getEl("left-load").onclick =
            loadLeft;
    }

    if (getEl("right-load")) {

        getEl("right-load").onclick =
            loadRight;
    }

    await loadLeft();

    await loadRight();

    await loadMacro();

    setInterval(async () => {

        await loadLeft();

        await loadRight();

        await loadMacro();

    }, 60000);
};
