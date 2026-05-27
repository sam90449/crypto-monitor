let leftCache = null;
let rightCache = null;
let macroCache = null;

function el(id) {

    return document.getElementById(id);
}

async function getJson(url) {

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

        console.log("URL:", url);
        console.log("RAW:", text);

        if (!text || text.includes("error")) {

            return {
                error: text
            };
        }

        return JSON.parse(text);

    } catch (e) {

        console.log(e);

        return {
            error: e.toString()
        };
    }
}

function fixNum(v, d = 4) {

    const n =
        parseFloat(v);

    if (
        isNaN(n) ||
        n === null ||
        n === undefined
    ) {

        return "0.0000";
    }

    return n.toFixed(d);
}

function colorPredict(v) {

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

function renderCoin(side, data) {

    const box =
        el(`${side}-card`);

    if (!box) {
        return;
    }

    if (!data || data.error) {

        box.innerHTML = `

<div style="
font-size:28px;
font-weight:bold;
color:#ff5577;
">
LOAD FAIL
</div>

<div style="
margin-top:15px;
font-size:18px;
color:#999;
word-break:break-all;
">
${data?.error || "UNKNOWN"}
</div>

`;

        return;
    }

    const predict =
        parseFloat(data.predict || 0);

    box.innerHTML = `

<div style="
font-size:34px;
font-weight:bold;
margin-bottom:25px;
">
${data.symbol || "-"}USDT
</div>

<div>
PRICE:
${fixNum(data.price)}
</div>

<br>

<div>
TARGET:
${fixNum(data.target)}
</div>

<br>

<div>
5 MA:
${fixNum(data.ma5)}
</div>

<br>

<div>
15 MA:
${fixNum(data.ma15)}
</div>

<br>

<div>
30 MA:
${fixNum(data.ma30)}
</div>

<br>

<div>
5 MA SLOPE:
${fixNum(data.ma5slope)}%
</div>

<br>

<div>
15 MA SLOPE:
${fixNum(data.ma15slope)}%
</div>

<br>

<div>
30 MA SLOPE:
${fixNum(data.ma30slope)}%
</div>

<br>

<div style="
font-size:30px;
font-weight:bold;
color:${colorPredict(predict)};
">
FINAL PREDICT:
${fixNum(predict)}%
</div>

`;
}

function renderMacro(data) {

    const box =
        el("macro-card");

    if (!box) {
        return;
    }

    if (!data || data.error) {

        box.innerHTML = `

<div style="
font-size:32px;
font-weight:bold;
color:#ff5577;
">
MACRO LOAD FAIL
</div>

<div style="
margin-top:20px;
font-size:18px;
color:#999;
word-break:break-all;
">
${data?.error || "UNKNOWN"}
</div>

`;

        return;
    }

    box.innerHTML = `

<div style="
font-size:42px;
font-weight:bold;
margin-bottom:30px;
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
${fixNum(data.btc,2)}
</div>

<div style="
font-size:30px;
margin-bottom:18px;
">
ETH:
${fixNum(data.eth,2)}
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
        el("left-input")
        .value
        .trim()
        .toUpperCase();

    el("left-card").innerHTML =
        "Loading...";

    const data =
        await getJson(
            `/api/coin/${symbol}`
        );

    leftCache = data;

    renderCoin(
        "left",
        data
    );
}

async function loadRight() {

    const symbol =
        el("right-input")
        .value
        .trim()
        .toUpperCase();

    el("right-card").innerHTML =
        "Loading...";

    const data =
        await getJson(
            `/api/coin/${symbol}`
        );

    rightCache = data;

    renderCoin(
        "right",
        data
    );
}

async function loadMacro() {

    el("macro-card").innerHTML =
        "Loading...";

    const data =
        await getJson(
            `/api/macro`
        );

    macroCache = data;

    renderMacro(data);
}

window.onload = async function () {

    console.log("SCRIPT START");

    if (el("left-load")) {

        el("left-load").onclick =
            loadLeft;
    }

    if (el("right-load")) {

        el("right-load").onclick =
            loadRight;
    }

    await loadLeft();

    await loadRight();

    await loadMacro();

    setInterval(async function () {

        await loadLeft();

        await loadRight();

        await loadMacro();

    }, 60000);
};
