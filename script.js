const API_URL =
"https://wispy-dawn-5bf8.jacky12345cheung.workers.dev/";

let currentSymbol = "BTCUSDT";

function safeSetText(id, text) {

    const el = document.getElementById(id);

    if (el) {
        el.innerText = text;
    }
}

async function fetchGlobal() {

    const res = await fetch(API_URL);

    return await res.json();
}

async function loadGlobalData() {

    try {

        const globalData = await fetchGlobal();

        if (!globalData || !globalData.success) {
            return;
        }

        safeSetText(
            "dxy",
            `DXY美元指數: ${globalData.dxy.value.toFixed(2)} (${globalData.dxy.change.toFixed(2)}%)`
        );

        safeSetText(
            "dow",
            `道瓊斯指數: ${globalData.dow.value.toLocaleString()} (${globalData.dow.change.toFixed(2)}%)`
        );

        safeSetText(
            "us10y",
            `美債10年期: ${globalData.us10y.value.toFixed(2)}% (${globalData.us10y.change.toFixed(2)}%)`
        );

        safeSetText(
            "vix",
            `恐慌指數(VIX): ${globalData.vix.value.toFixed(2)} (${globalData.vix.change.toFixed(2)}%)`
        );

        safeSetText(
            "gold",
            `黃金: ${globalData.gold.value.toFixed(2)} (${globalData.gold.change.toFixed(2)}%)`
        );

        safeSetText(
            "fear",
            `MARKET FEAR: ${globalData.fear.text} (${globalData.fear.value})`
        );

        safeSetText(
            "updateTime",
            `最後更新: ${globalData.updateTime || ""}`
        );

    } catch (e) {

        console.log(e);
    }
}

function createBTCChart(symbol) {

    document.getElementById("btc_chart").innerHTML = "";

    new TradingView.widget({

        width: "100%",

        height: 760,

        symbol: `BINANCE:${symbol}`,

        interval: "5",

        timezone: "Asia/Hong_Kong",

        theme: "dark",

        style: "1",

        locale: "zh_TW",

        toolbar_bg: "#000000",

        enable_publishing: false,

        hide_side_toolbar: true,

        allow_symbol_change: false,

        save_image: false,

        withdateranges: false,

        studies: [
            "MASimple@tv-basicstudies"
        ],

        container_id: "btc_chart"
    });
}

function createDXYChart() {

    document.getElementById("dxy_chart").innerHTML = "";

    new TradingView.widget({

        width: "100%",

        height: 760,

        symbol: "INDEX:DXY",

        interval: "1M",

        timezone: "Asia/Hong_Kong",

        theme: "dark",

        style: "3",

        locale: "zh_TW",

        toolbar_bg: "#000000",

        enable_publishing: false,

        hide_side_toolbar: true,

        allow_symbol_change: false,

        save_image: false,

        withdateranges: false,

        studies: [],

        container_id: "dxy_chart"
    });
}

function normalizeSymbol(input) {

    let s = input
        .trim()
        .toUpperCase();

    s = s.replace("USDT", "");

    return s + "USDT";
}

function loadSymbol() {

    const input =
        document.getElementById("symbolInput");

    let symbol =
        input.value.trim();

    if (!symbol) {
        symbol = "BTC";
    }

    currentSymbol =
        normalizeSymbol(symbol);

    const pure =
        currentSymbol.replace("USDT", "");

    document.getElementById(
        "leftTitle"
    ).innerText =
        `${pure} 即時5m 走勢`;

    createBTCChart(currentSymbol);
}

document
.getElementById("loadBtn")
.addEventListener(
    "click",
    loadSymbol
);

document
.getElementById("symbolInput")
.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Enter"){
            loadSymbol();
        }
    }
);

createBTCChart(currentSymbol);

createDXYChart();

loadGlobalData();

setInterval(loadGlobalData, 30000);
