async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.lastPrice) {
            return null;
        }

        return {
            price: parseFloat(data.lastPrice),
            change: parseFloat(data.priceChangePercent),
            volume: parseFloat(data.quoteVolume)
        };

    } catch (e) {

        return null;
    }
}

function updateHKTime() {

    const now = new Date();

    const hk = new Intl.DateTimeFormat(
        'en-GB',
        {
            timeZone: 'Asia/Hong_Kong',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    ).format(now);

    const el = document.getElementById("hkTime");

    if (el) {
        el.innerText = hk;
    }
}

setInterval(updateHKTime, 1000);

updateHKTime();

function createBoxes(count) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        if (i < count) {

            html += `<div class="box active"></div>`;

        } else {

            html += `<div class="box"></div>`;
        }
    }

    return html;
}

function predictionText(score) {

    if (score >= 5) {
        return "強烈看升 🚀";
    }

    if (score >= 3) {
        return "偏強看升 📈";
    }

    if (score >= 1) {
        return "輕微看升 🟢";
    }

    if (score <= -5) {
        return "強烈看跌 🔻";
    }

    if (score <= -3) {
        return "偏弱看跌 📉";
    }

    if (score <= -1) {
        return "輕微看跌 🔴";
    }

    return "中性震盪 🟣";
}

function buildScore(change, volume) {

    let score = 0;

    if (change > 0.4) score += 1;
    if (change > 1.2) score += 1;
    if (change > 2) score += 1;
    if (change > 3.5) score += 1;

    if (change < -0.4) score -= 1;
    if (change < -1.2) score -= 1;
    if (change < -2) score -= 1;
    if (change < -3.5) score -= 1;

    if (volume > 1000000000) {
        score += 1;
    }

    if (volume < 150000000) {
        score -= 1;
    }

    return score;
}

function updateBoxes(side, score) {

    const up1 =
        Math.max(0, Math.min(4, score + 1));

    const up15 =
        Math.max(0, Math.min(4, score));

    const up2 =
        Math.max(0, Math.min(4, score - 1));

    const down1 =
        Math.max(0, Math.min(4, -score + 1));

    const down15 =
        Math.max(0, Math.min(4, -score));

    const down2 =
        Math.max(0, Math.min(4, -score - 1));

    document.getElementById(`${side}Boxes1`).innerHTML =
        createBoxes(up1);

    document.getElementById(`${side}Boxes15`).innerHTML =
        createBoxes(up15);

    document.getElementById(`${side}Boxes2`).innerHTML =
        createBoxes(up2);

    document.getElementById(`${side}Down1`).innerHTML =
        createBoxes(down1);

    document.getElementById(`${side}Down15`).innerHTML =
        createBoxes(down15);

    document.getElementById(`${side}Down2`).innerHTML =
        createBoxes(down2);
}

async function loadCoin(side) {

    const symbolInput =
        document.getElementById(`${side}Input`);

    const symbol =
        symbolInput.value
        .trim()
        .toUpperCase();

    if (!symbol) {
        return;
    }

    document.getElementById(`${side}Symbol`).innerText =
        `${symbol}/USDT`;

    document.getElementById(`${side}Price`).innerText =
        "Loading...";

    document.getElementById(`${side}Prediction`).innerText =
        "Loading...";

    const result =
        await getBinancePrice(symbol);

    if (!result) {

        document.getElementById(`${side}Price`).innerText =
            "LOAD ERROR";

        document.getElementById(`${side}Prediction`).innerText =
            "LOAD ERROR";

        return;
    }

    const score =
        buildScore(
            result.change,
            result.volume
        );

    document.getElementById(`${side}Price`).innerText =
        result.price;

    document.getElementById(`${side}Prediction`).innerText =
        predictionText(score);

    updateBoxes(side, score);

    document.getElementById(`${side}Fear`).innerText =
        "22";

    document.getElementById(`${side}Dxy`).innerText =
        "99.33";

    document.getElementById(`${side}Dow`).innerText =
        "50644.28";

    document.getElementById(`${side}Vix`).innerText =
        "16.72";

    document.getElementById(`${side}Gold`).innerText =
        "4419.80";

    document.getElementById(`${side}Us10y`).innerText =
        "0.45";

    document.getElementById(`${side}FearText`).innerText =
        "Extreme Fear";

    const now =
        new Intl.DateTimeFormat(
            'en-GB',
            {
                timeZone: 'Asia/Hong_Kong',
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        ).format(new Date());

    document.getElementById(`${side}Update`).innerText =
        now;

    const bottom =
        document.getElementById("bottomLoading");

    if (bottom) {
        bottom.style.display = "none";
    }
}

window.onload = () => {

    loadCoin("left");

    loadCoin("right");

    const leftBtn =
        document.getElementById("leftLoad");

    const rightBtn =
        document.getElementById("rightLoad");

    if (leftBtn) {

        leftBtn.addEventListener(
            "click",
            () => loadCoin("left")
        );
    }

    if (rightBtn) {

        rightBtn.addEventListener(
            "click",
            () => loadCoin("right")
        );
    }
};
