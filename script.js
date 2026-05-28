const API_URL =
"https://wispy-dawn-5bf8.jacky12345cheung.workers.dev/";

function safeSetText(id, text) {

    const el = document.getElementById(id);

    if (el) {
        el.innerText = text;
    }
}

function safeSetHTML(id, html) {

    const el = document.getElementById(id);

    if (el) {
        el.innerHTML = html;
    }
}

function createBlocks(active, color) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        html += `
        <div class="block ${i < active ? "active" : ""}"
             style="${i < active ? `background:${color};` : ""}">
        </div>
        `;
    }

    return html;
}

function setBlocks(score) {

    let up1 = 0;
    let up15 = 0;
    let up2 = 0;

    let down1 = 0;
    let down15 = 0;
    let down2 = 0;

    if (score >= 5) {

        up1 = 4;
        up15 = 4;
        up2 = 4;

    } else if (score >= 2) {

        up1 = 3;
        up15 = 2;
        up2 = 1;

    } else if (score >= -1) {

        up1 = 1;
        down1 = 1;

    } else if (score >= -4) {

        down1 = 2;
        down15 = 3;
        down2 = 2;

    } else {

        down1 = 1;
        down15 = 2;
        down2 = 3;
    }

    safeSetHTML(
        "btc_up_1",
        createBlocks(up1, "#00ff99")
    );

    safeSetHTML(
        "btc_up_15",
        createBlocks(up15, "#00ff99")
    );

    safeSetHTML(
        "btc_up_2",
        createBlocks(up2, "#00ff99")
    );

    safeSetHTML(
        "btc_down_1",
        createBlocks(down1, "#ff3355")
    );

    safeSetHTML(
        "btc_down_15",
        createBlocks(down15, "#ff3355")
    );

    safeSetHTML(
        "btc_down_2",
        createBlocks(down2, "#ff3355")
    );

    safeSetHTML(
        "dow_up_1",
        createBlocks(up1 >= 2 ? 2 : 1, "#00ff99")
    );

    safeSetHTML(
        "dow_up_15",
        createBlocks(up15 >= 2 ? 1 : 0, "#00ff99")
    );

    safeSetHTML(
        "dow_up_2",
        createBlocks(up2 >= 2 ? 1 : 0, "#00ff99")
    );

    safeSetHTML(
        "dow_down_1",
        createBlocks(down1 >= 2 ? 2 : 0, "#ff3355")
    );

    safeSetHTML(
        "dow_down_15",
        createBlocks(down15 >= 2 ? 2 : 0, "#ff3355")
    );

    safeSetHTML(
        "dow_down_2",
        createBlocks(down2 >= 2 ? 2 : 0, "#ff3355")
    );
}

function getDirection(score) {

    if (score >= 5) {

        return {
            title: "強勢看漲",
            risk: "Strong Pump",
            color: "#00ff99",
            emoji: "🟢"
        };
    }

    if (score >= 2) {

        return {
            title: "偏強看漲",
            risk: "Bullish",
            color: "#00ffee",
            emoji: "🟢"
        };
    }

    if (score >= -1) {

        return {
            title: "中性震盪",
            risk: "No Major Alert",
            color: "#ffee00",
            emoji: "🟡"
        };
    }

    if (score >= -4) {

        return {
            title: "偏弱看跌",
            risk: "Bearish",
            color: "#ff6688",
            emoji: "🔴"
        };
    }

    return {
        title: "強勢看跌",
        risk: "Major Dump Risk",
        color: "#ff3355",
        emoji: "🔴"
    };
}

async function fetchBinance() {

    const res = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
    );

    return await res.json();
}

async function fetchGlobal() {

    const res = await fetch(API_URL);

    return await res.json();
}

function calcScore(g, btcChange) {

    let score = 0;

    if (g.dxy.change > 0) score -= 1;
    else score += 1;

    if (g.vix.change > 0) score -= 1;
    else score += 1;

    if (g.gold.change > 0) score -= 1;
    else score += 1;

    if (g.us10y.change > 0) score -= 1;
    else score += 1;

    if (g.dow.change > 0) score += 1;
    else score -= 1;

    if (g.fear.value <= 25) score -= 2;

    if (g.fear.value >= 75) score += 2;

    if (btcChange > 0) score += 1;
    else score -= 1;

    return score;
}

async function loadData() {

    try {

        safeSetText(
            "alertBox",
            "Loading..."
        );

        const [
            btc,
            globalData
        ] = await Promise.all([
            fetchBinance(),
            fetchGlobal()
        ]);

        if (!globalData || !globalData.success) {

            safeSetText(
                "alertBox",
                "Worker API Error"
            );

            return;
        }

        const btcPrice =
            Number(btc.lastPrice);

        const btcChange =
            Number(btc.priceChangePercent);

        const btcVolume =
            Number(btc.volume);

        const score =
            calcScore(globalData, btcChange);

        const dir =
            getDirection(score);

        safeSetText(
            "alertBox",
            `⚠ ${dir.risk}`
        );

        safeSetText(
            "predictionText",
            `短線預測 | 15m: ${(btcChange / 18).toFixed(2)}% | 30m: ${(btcChange / 9).toFixed(2)}%`
        );

        safeSetText(
            "btcPrice",
            `BTC: ${btcPrice.toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })} USDT (${btcChange.toFixed(2)}%)`
        );

        safeSetText(
            "btcVolume",
            `BTC成交量: ${Math.round(btcVolume).toLocaleString()}`
        );

        safeSetHTML(
            "macroText",
            `${dir.emoji} 宏觀方向：${dir.title} | SCORE: ${score}`
        );

        const macro =
            document.getElementById("macroText");

        if (macro) {
            macro.style.color = dir.color;
        }

        safeSetText(
            "macroReason",
            "全球宏觀數據分析中..."
        );

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
            globalData.updateTime || ""
        );

        setBlocks(score);

    } catch (e) {

        console.log(e);

        safeSetText(
            "alertBox",
            "Load Failed"
        );
    }
}

loadData();

setInterval(loadData, 15000);
