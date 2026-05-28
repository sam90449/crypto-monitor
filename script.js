const API_URL =
"https://wispy-dawn-5bf8.jacky12345cheung.workers.dev/";

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

    document.getElementById("up1").innerHTML =
        createBlocks(up1, "#00ff99");

    document.getElementById("up15").innerHTML =
        createBlocks(up15, "#00ff99");

    document.getElementById("up2").innerHTML =
        createBlocks(up2, "#00ff99");

    document.getElementById("down1").innerHTML =
        createBlocks(down1, "#ff3355");

    document.getElementById("down15").innerHTML =
        createBlocks(down15, "#ff3355");

    document.getElementById("down2").innerHTML =
        createBlocks(down2, "#ff3355");
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

    const res = await fetch(API_URL, {
        method: "GET"
    });

    const text = await res.text();

    try {

        return JSON.parse(text);

    } catch {

        console.log("Worker回傳不是JSON:");
        console.log(text);

        return null;
    }
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

        document.getElementById("riskText").innerText =
            "Loading...";

        const [
            btc,
            globalData
        ] = await Promise.all([
            fetchBinance(),
            fetchGlobal()
        ]);

        if (!globalData || !globalData.success) {

            document.getElementById("riskText").innerText =
                "Worker API Error";

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

        document.getElementById("riskText").innerText =
            `⚠ ${dir.risk}`;

        document.getElementById("shortPredict").innerText =
            `短線預測 | 15m: ${(btcChange / 18).toFixed(2)}% | 30m: ${(btcChange / 9).toFixed(2)}%`;

        document.getElementById("btcPrice").innerText =
            `BTC: ${btcPrice.toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })} USDT (${btcChange.toFixed(2)}%)`;

        document.getElementById("btcVolume").innerText =
            `BTC成交量: ${Math.round(btcVolume).toLocaleString()}`;

        document.getElementById("macroDirection").innerHTML =
            `${dir.emoji} 宏觀方向：${dir.title} | SCORE: ${score}`;

        document.getElementById("macroDirection").style.color =
            dir.color;

        document.getElementById("dxy").innerText =
            `DXY美元指數: ${globalData.dxy.value.toFixed(2)} (${globalData.dxy.change.toFixed(2)}%)`;

        document.getElementById("dow").innerText =
            `道瓊斯指數: ${globalData.dow.value.toLocaleString()} (${globalData.dow.change.toFixed(2)}%)`;

        document.getElementById("us10y").innerText =
            `美債10年期: ${globalData.us10y.value.toFixed(2)}% (${globalData.us10y.change.toFixed(2)}%)`;

        document.getElementById("vix").innerText =
            `恐慌指數(VIX): ${globalData.vix.value.toFixed(2)} (${globalData.vix.change.toFixed(2)}%)`;

        document.getElementById("gold").innerText =
            `黃金: ${globalData.gold.value.toFixed(2)} (${globalData.gold.change.toFixed(2)}%)`;

        document.getElementById("fear").innerText =
            `MARKET FEAR: ${globalData.fear.text} (${globalData.fear.value})`;

        setBlocks(score);

    } catch (e) {

        console.log(e);

        document.getElementById("riskText").innerText =
            "Load Failed";
    }
}

loadData();

setInterval(loadData, 15000);
