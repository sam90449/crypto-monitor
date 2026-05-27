let leftCache = null;
let rightCache = null;
let macroCache = null;

function $(id) {
    return document.getElementById(id);
}

async function safeFetch(url) {

    try {

        const response = await fetch(
            `${url}?t=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const text = await response.text();

        console.log("FETCH URL:", url);
        console.log("FETCH TEXT:", text);

        if (!response.ok) {

            return {
                error: `HTTP ${response.status}`
            };
        }

        if (
            !text ||
            text.includes("Cannot read") ||
            text.includes("FETCH FAIL") ||
            text.includes("TypeError")
        ) {

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

function num(v, d = 4) {

    const n = Number(v);

    if (
        v === undefined ||
        v === null ||
        isNaN(n)
    ) {

        return (0).toFixed(d);
    }

    return n.toFixed(d);
}

function predictColor(v) {

    const n = Number(v);

    if (n > 0) {
        return "#00ff99";
    }

    if (n < 0) {
        return "#ff5577";
    }

    return "#ffffff";
}

function renderCoin(side, data) {

    const card =
        $(`${side}-card`);

    if (!card) return;

    if (!data || data.error) {

        card.innerHTML = `

<div style="
font-size:32px;
font-weight:bold;
color:#ff5577;
margin-bottom:20px;
">
LOAD FAIL
</div>

<div style="
font-size:16px;
color:#aaa;
word-break:break-all;
">
${data?.error || "UNKNOWN ERROR"}
</div>

`;

        return;
    }

    const predict =
        Number(data.predict || 0);

    card.innerHTML = `

<div style="
font-size:34px;
font-weight:bold;
margin-bottom:25px;
">
${data.symbol || "-"}USDT
</div>

<div>PRICE: ${num(data.price)}</div>
<br>

<div>TARGET: ${num(data.target)}</div>
<br>

<div>5 MA: ${num(data.ma5)}</div>
<br>

<div>15 MA: ${num(data.ma15)}</div>
<br>

<div>30 MA: ${num(data.ma30)}</div>
<br>

<div>5 MA SLOPE: ${num(data.ma5slope)}%</div>
<br>

<div>15 MA SLOPE: ${num(data.ma15slope)}%</div>
<br>

<div>30 MA SLOPE: ${num(data.ma30slope)}%</div>
<br>

<div style="
font-size:30px;
font-weight:bold;
color:${predictColor(predict)};
">
FINAL PREDICT:
${num(predict)}%
</div>

`;
}

function renderMacro(data) {

    const card =
        $("macro-card");

    if (!card) return;

    if (!data || data.error) {

        card.innerHTML = `

<div style="
font-size:32px;
font-weight:bold;
color:#ff5577;
margin-bottom:20px;
">
MACRO LOAD FAIL
</div>

<div style="
font-size:18px;
color:#aaa;
word-break:break-all;
">
${data?.error || "UNKNOWN"}
</div>

`;

        return;
    }

    card.innerHTML = `

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
font-size:28px;
margin-bottom:15px;
">
BTC:
${num(data.btc, 2)}
</div>

<div style="
font-size:28px;
margin-bottom:15px;
">
ETH:
${num(data.eth, 2)}
</div>

<div style="
font-size:28px;
margin-bottom:15px;
">
BTC 24H CHANGE:
${data.btcChange || "-"}
</div>

<div style="
font-size:28px;
margin-bottom:15px;
">
BTC VOLUME:
${data.btcVolume || "-"}
</div>

<div style="
font-size:28px;
">
HK UPDATE:
${data.updateTime || "-"}
</div>

`;
}

async function loadLeft() {

    const symbol =
        $("left-input")
        .value
        .trim()
        .toUpperCase();

    $("left-card").innerHTML =
        "Loading...";

    const data =
        await safeFetch(
            `/api/coin/${symbol}`
        );

    leftCache = data;

    renderCoin("left", data);
}

async function loadRight() {

    const symbol =
        $("right-input")
        .value
        .trim()
        .toUpperCase();

    $("right-card").innerHTML =
        "Loading...";

    const data =
        await safeFetch(
            `/api/coin/${symbol}`
        );

    rightCache = data;

    renderCoin("right", data);
}

async function loadMacro() {

    $("macro-card").innerHTML =
        "Loading...";

    const data =
        await safeFetch("/api/macro");

    console.log("MACRO:", data);

    macroCache = data;

    renderMacro(data);
}

window.onload = async function () {

    console.log("SCRIPT START");

    if ($("left-load")) {

        $("left-load").onclick =
            loadLeft;
    }

    if ($("right-load")) {

        $("right-load").onclick =
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
