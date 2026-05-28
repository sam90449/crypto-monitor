const API_URL =
"https://wispy-dawn-5bf8.jacky12345cheung.workers.dev";

function getFearText(v) {

    if (v <= 25) return "Extreme Fear";
    if (v <= 45) return "Fear";
    if (v <= 55) return "Neutral";
    if (v <= 75) return "Greed";

    return "Extreme Greed";
}

function createBlocks(activeCount, color = "#00ff99") {

    let html = "";

    for (let i = 0; i < 4; i++) {

        html += `
        <div
          class="block"
          style="
            background:${i < activeCount ? color : '#222'};
          ">
        </div>
        `;
    }

    return html;
}

function setGrid(score) {

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

    document.getElementById("up1")
        .innerHTML = createBlocks(up1, "#00ff99");

    document.getElementById("up15")
        .innerHTML = createBlocks(up15, "#00ff99");

    document.getElementById("up2")
        .innerHTML = createBlocks(up2, "#00ff99");

    document.getElementById("down1")
        .innerHTML = createBlocks(down1, "#ff4466");

    document.getElementById("down15")
        .innerHTML = createBlocks(down15, "#ff4466");

    document.getElementById("down2")
        .innerHTML = createBlocks(down2, "#ff4466");
}

function calcScore(globalData, btcChange) {

    let score = 0;

    if (globalData.dxy.change > 0)
        score -= 1;
    else
        score += 1;

    if (globalData.vix.change > 0)
        score -= 1;
    else
        score += 1;

    if (globalData.gold.change > 0)
        score -= 1;
    else
        score += 1;

    if (globalData.us10y.change > 0)
        score -= 1;
    else
        score += 1;

    if (globalData.dow.change > 0)
        score += 1;
    else
        score -= 1;

    if (globalData.fear.value <= 25)
        score -= 2;

    if (globalData.fear.value >= 75)
        score += 2;

    if (btcChange > 0)
        score += 1;
    else
        score -= 1;

    return score;
}

function getDirection(score) {

    if (score >= 5) {

        return {
            risk: "Strong Pump",
            text: "強勢看漲",
            color: "#00ff99",
            emoji: "🟢"
        };
    }

    if (score >= 2) {

        return {
            risk: "Bullish",
            text: "偏強看漲",
            color: "#00ffee",
            emoji: "🟢"
        };
    }

    if (score >= -1) {

        return {
            risk: "No Major Alert",
            text: "中性震盪",
            color: "#ffee00",
            emoji: "🟡"
        };
    }

    if (score >= -4) {

        return {
            risk: "Bearish",
            text: "偏弱看跌",
            color: "#ff5577",
            emoji: "🔴"
        };
    }

    return {
        risk: "Major Dump Risk",
        text: "強勢看跌",
        color: "#ff3344",
        emoji: "🔴"
    };
}

async function fetchBTC() {

    const res = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
    );

    return await res.json();
}

async function fetchGlobalData() {

    const res = await fetch(API_URL);

    return await res.json();
}

async function loadData() {

    try {

        const [
            btc,
            globalData
        ] = await Promise.all([

            fetchBTC(),
            fetchGlobalData()
        ]);

        if (!globalData.success) {
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

        const direction =
            getDirection(score);

        document.getElementById("riskText")
            .innerText =
            `⚠ ${direction.risk}`;

        document.getElementById("shortPredict")
            .innerText =
            `短線預測 | 15m: ${(btcChange / 18).toFixed(2)}% | 30m: ${(btcChange / 9).toFixed(2)}%`;

        document.getElementById("btcPrice")
            .innerText =
            `BTC: ${btcPrice.toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })} USDT (${btcChange.toFixed(2)}%)`;

        document.getElementById("btcVolume")
            .innerText =
            `BTC成交量: ${Math.round(btcVolume).toLocaleString()}`;

        document.getElementById("macroDirection")
            .innerHTML =
            `${direction.emoji} 宏觀方向：${direction.text} | SCORE: ${score}`;

        document.getElementById("macroDirection")
            .style.color =
            direction.color;

        document.getElementById("dxy")
            .innerText =
            `DXY美元指數: ${globalData.dxy.value.toFixed(2)} (${globalData.dxy.change.toFixed(2)}%)`;

        document.getElementById("dow")
            .innerText =
            `道瓊斯指數: ${globalData.dow.value.toLocaleString()} (${globalData.dow.change.toFixed(2)}%)`;

        document.getElementById("us10y")
            .innerText =
            `美債10年期: ${globalData.us10y.value.toFixed(2)}% (${globalData.us10y.change.toFixed(2)}%)`;

        document.getElementById("vix")
            .innerText =
            `恐慌指數(VIX): ${globalData.vix.value.toFixed(2)} (${globalData.vix.change.toFixed(2)}%)`;

        document.getElementById("gold")
            .innerText =
            `黃金: ${globalData.gold.value.toFixed(2)} (${globalData.gold.change.toFixed(2)}%)`;

        document.getElementById("fear")
            .innerText =
            `MARKET FEAR: ${globalData.fear.text} (${globalData.fear.value})`;

        setGrid(score);

    } catch (e) {

        console.log(e);
    }
}

loadData();

setInterval(loadData, 15000);
