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

    if (score >= 8) {
        up2 = 4;
        up15 = 4;
        up1 = 4;
    }

    else if (score >= 6) {
        up2 = 3;
        up15 = 4;
        up1 = 4;
    }

    else if (score >= 4) {
        up2 = 2;
        up15 = 3;
        up1 = 3;
    }

    else if (score >= 2) {
        up2 = 1;
        up15 = 2;
        up1 = 2;
    }

    else if (score <= -8) {
        down2 = 4;
        down15 = 4;
        down1 = 4;
    }

    else if (score <= -6) {
        down2 = 3;
        down15 = 4;
        down1 = 4;
    }

    else if (score <= -4) {
        down2 = 2;
        down15 = 3;
        down1 = 3;
    }

    else if (score <= -2) {
        down2 = 1;
        down15 = 2;
        down1 = 2;
    }

    document.getElementById("btc_up_1").innerHTML =
        createBlocks(up1, "#00ffae");

    document.getElementById("btc_up_15").innerHTML =
        createBlocks(up15, "#00ffae");

    document.getElementById("btc_up_2").innerHTML =
        createBlocks(up2, "#00ffae");

    document.getElementById("btc_down_1").innerHTML =
        createBlocks(down1, "#ff425d");

    document.getElementById("btc_down_15").innerHTML =
        createBlocks(down15, "#ff425d");

    document.getElementById("btc_down_2").innerHTML =
        createBlocks(down2, "#ff425d");

    document.getElementById("eth_up_1").innerHTML =
        createBlocks(up1, "#00ffae");

    document.getElementById("eth_up_15").innerHTML =
        createBlocks(up15, "#00ffae");

    document.getElementById("eth_up_2").innerHTML =
        createBlocks(up2, "#00ffae");

    document.getElementById("eth_down_1").innerHTML =
        createBlocks(down1, "#ff425d");

    document.getElementById("eth_down_15").innerHTML =
        createBlocks(down15, "#ff425d");

    document.getElementById("eth_down_2").innerHTML =
        createBlocks(down2, "#ff425d");
}

function scoreToMode(score) {

    if (score <= -8) {
        return {
            icon: "🚨",
            title: "Major Dump Risk",
            macro: "強勢看跌",
            color: "#ff425d"
        };
    }

    if (score <= -5) {
        return {
            icon: "🔴",
            title: "Bearish",
            macro: "偏弱看跌",
            color: "#ff6fa9"
        };
    }

    if (score <= -2) {
        return {
            icon: "🟡",
            title: "中性震盪",
            macro: "中線偏弱",
            color: "#ffe600"
        };
    }

    if (score >= 8) {
        return {
            icon: "🚀",
            title: "Strong Bullish",
            macro: "強勢看漲",
            color: "#00ffae"
        };
    }

    if (score >= 5) {
        return {
            icon: "🟢",
            title: "Bullish",
            macro: "偏強看漲",
            color: "#00ffae"
        };
    }

    return {
        icon: "🟡",
        title: "Neutral",
        macro: "震盪整理",
        color: "#ffe600"
    };
}

function calcScore(data, btcChange) {

    let score = 0;

    if (data.dxy.change > 0.15) score -= 2;
    else if (data.dxy.change > 0.05) score -= 1;
    else if (data.dxy.change < -0.15) score += 2;

    if (data.vix.change > 2) score -= 2;
    else if (data.vix.change > 1) score -= 1;
    else if (data.vix.change < -2) score += 2;

    if (data.gold.change < -1) score -= 1;
    else if (data.gold.change > 1) score += 1;

    if (data.us10y.change > 0.3) score -= 2;
    else if (data.us10y.change > 0.1) score -= 1;
    else if (data.us10y.change < -0.3) score += 2;

    if (data.dow.change > 0.5) score += 2;
    else if (data.dow.change > 0.2) score += 1;
    else if (data.dow.change < -0.5) score -= 2;

    if (data.fear.value < 25) score -= 2;
    else if (data.fear.value < 40) score -= 1;
    else if (data.fear.value > 70) score += 2;

    if (btcChange <= -3) score -= 3;
    else if (btcChange <= -2) score -= 2;
    else if (btcChange <= -1) score -= 1;

    return score;
}

async function loadData() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        const btcPrice =
            73350 + ((Math.random() - 0.5) * 80);

        const btcChange =
            -3.3 + ((Math.random() - 0.5) * 0.4);

        const btcVolume =
            1740000000 + Math.floor(Math.random() * 5000000);

        const score =
            calcScore(data, btcChange);

        const mode =
            scoreToMode(score);

        setBlocks(score);

        document.getElementById("alertBox").innerHTML =
            `${mode.icon} ${mode.title}`;

        document.getElementById("alertBox").style.color =
            mode.color;

        document.getElementById("shortPredict").innerHTML =
            `短線預測 | 15m: ${(btcChange / 20).toFixed(2)}% | 30m: ${(btcChange / 10).toFixed(2)}%`;

        document.getElementById("btcPrice").innerHTML =
            `BTC: ${btcPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} USDT (${btcChange.toFixed(2)}%)`;

        document.getElementById("btcVolume").innerHTML =
            `BTC成交量: ${btcVolume.toLocaleString()}`;

        document.getElementById("macroText").innerHTML =
            `${mode.icon} 宏觀方向：${mode.macro} | SCORE: ${score}`;

        document.getElementById("macroText").style.color =
            mode.color;

        document.getElementById("macroSub").innerHTML =
            "全球宏觀數據推敲分析中...";

        document.getElementById("dxy").innerHTML =
            `DXY美元指數: ${data.dxy.value.toFixed(2)} (${data.dxy.change.toFixed(2)}%)`;

        document.getElementById("dow").innerHTML =
            `道瓊斯指數: ${data.dow.value.toLocaleString()} (${data.dow.change.toFixed(2)}%)`;

        document.getElementById("us10y").innerHTML =
            `美債10年期: ${data.us10y.value.toFixed(2)}% (${data.us10y.change.toFixed(2)}%)`;

        document.getElementById("vix").innerHTML =
            `恐慌指數(VIX): ${data.vix.value.toFixed(2)} (${data.vix.change.toFixed(2)}%)`;

        document.getElementById("gold").innerHTML =
            `黃金: ${data.gold.value.toFixed(2)} (${data.gold.change.toFixed(2)}%)`;

        document.getElementById("fear").innerHTML =
            `MARKET FEAR: ${data.fear.text} (${data.fear.value})`;

    } catch (e) {

        console.log(e);

        document.getElementById("alertBox").innerHTML =
            "Global Data Error";

        document.getElementById("macroText").innerHTML =
            "Worker API Error";
    }
}

loadData();

setInterval(loadData, 15000);
