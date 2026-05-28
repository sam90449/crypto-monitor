async function getBinancePrice(symbol) {

    try {

        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.price) {

            return "UNSUPPORTED";

        }

        return Number(data.price);

    } catch (error) {

        return "API ERROR";

    }

}

async function getMacroData() {

    try {

        const response = await fetch("/api/macro");

        const data = await response.json();

        return data;

    } catch (error) {

        return {

            btc: "N/A",
            eth: "N/A",
            btcChange: "N/A",
            btcVolume: "N/A",
            totalCap: "N/A",
            btcDom: "N/A",
            dxy: "N/A",
            dow: "N/A",
            vix: "N/A",
            us10y: "N/A",
            gold: "N/A",
            fear: "N/A",
            fearText: "N/A",
            status: "中性震盪",
            icon: "🟣",
            updateTime: "N/A"

        };

    }

}

function renderColorBoxes(count, color) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        if (i < count) {

            html += `<div class="small-box ${color}"></div>`;

        } else {

            html += `<div class="small-box"></div>`;

        }

    }

    return html;

}

function renderBoxes(score) {

    let up1 = 0;
    let up15 = 0;
    let up2 = 0;

    let down1 = 0;
    let down15 = 0;
    let down2 = 0;

    // =========================
    // BULLISH
    // =========================

    if (score >= 1) {

        up1 = 1;

    }

    if (score >= 2) {

        up1 = 2;
        up15 = 1;

    }

    if (score >= 3) {

        up1 = 3;
        up15 = 2;

    }

    if (score >= 4) {

        up1 = 4;
        up15 = 3;
        up2 = 2;

    }

    if (score >= 5) {

        up1 = 4;
        up15 = 4;
        up2 = 3;

    }

    // =========================
    // BEARISH
    // =========================

    if (score <= -1) {

        down1 = 1;

    }

    if (score <= -2) {

        down1 = 2;
        down15 = 1;

    }

    if (score <= -3) {

        down1 = 3;
        down15 = 2;

    }

    if (score <= -4) {

        down1 = 4;
        down15 = 3;
        down2 = 2;

    }

    if (score <= -5) {

        down1 = 4;
        down15 = 4;
        down2 = 3;

    }

    return `

        <div class="box-grid">

            <div class="box-row">

                <div class="box-label green-text">
                    ▲1%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(up1, "green")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label green-text">
                    ▲1.5%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(up15, "green")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label green-text">
                    ▲2%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(up2, "green")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label red-text">
                    ▼1%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(down1, "red")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label red-text">
                    ▼1.5%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(down15, "red")}
                </div>

            </div>

            <div class="box-row">

                <div class="box-label red-text">
                    ▼2%
                </div>

                <div class="box-container">
                    ${renderColorBoxes(down2, "red")}
                </div>

            </div>

        </div>

    `;

}

async function loadCoin(side) {

    const inputId =
        side === "left"
            ? "leftInput"
            : "rightInput";

    const priceId =
        side === "left"
            ? "leftPrice"
            : "rightPrice";

    const predictionId =
        side === "left"
            ? "leftPrediction"
            : "rightPrediction";

    const boxesId =
        side === "left"
            ? "leftBoxes"
            : "rightBoxes";

    const infoId =
        side === "left"
            ? "leftInfo"
            : "rightInfo";

    const symbol =
        document
            .getElementById(inputId)
            .value
            .trim()
            .toUpperCase();

    document.getElementById(priceId).innerHTML =
        "Loading...";

    document.getElementById(predictionId).innerHTML =
        "Loading...";

    document.getElementById(boxesId).innerHTML =
        "";

    document.getElementById(infoId).innerHTML =
        "Loading...";

    const price =
        await getBinancePrice(symbol);

    const macro =
        await getMacroData();

    if (
        price === "UNSUPPORTED" ||
        price === "API ERROR"
    ) {

        document.getElementById(priceId).innerHTML =
            `${symbol}/USDT`;

        document.getElementById(predictionId).innerHTML =
            price;

        return;

    }

    let score = 0;

    if (macro.fear <= 25) {

        score -= 1;

    }

    if (macro.vix !== "N/A") {

        const vixNumber =
            parseFloat(
                String(macro.vix)
                    .replace(/[^\d.-]/g, "")
            );

        if (vixNumber >= 25) {

            score -= 1;

        }

    }

    if (macro.dxy !== "N/A") {

        const dxyNumber =
            parseFloat(
                String(macro.dxy)
                    .replace(/[^\d.-]/g, "")
            );

        if (dxyNumber <= 100) {

            score += 1;

        } else {

            score -= 1;

        }

    }

    let prediction = "中性震盪";
    let icon = "🟣";

    if (score >= 3) {

        prediction = "強勢看升";
        icon = "🟢";

    } else if (score >= 1) {

        prediction = "偏向看升";
        icon = "🟡";

    } else if (score <= -3) {

        prediction = "強勢看跌";
        icon = "🔴";

    } else if (score <= -1) {

        prediction = "偏向看跌";
        icon = "🟠";

    }

    document.getElementById(priceId).innerHTML =
        `
        ${symbol}/USDT
        <br>
        ${price}
        `;

    document.getElementById(predictionId).innerHTML =
        `
        ${prediction}
        ${icon}
        `;

    document.getElementById(boxesId).innerHTML =
        renderBoxes(score);

    document.getElementById(infoId).innerHTML =
        `
        <div class="info-grid">

            <div class="info-card">
                <div class="info-title">
                    FEAR
                </div>

                <div class="info-value">
                    ${macro.fear}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    DXY
                </div>

                <div class="info-value">
                    ${macro.dxy}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    DOW
                </div>

                <div class="info-value">
                    ${macro.dow}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    VIX
                </div>

                <div class="info-value">
                    ${macro.vix}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    GOLD
                </div>

                <div class="info-value">
                    ${macro.gold}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    US10Y
                </div>

                <div class="info-value">
                    ${macro.us10y}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    MARKET FEAR
                </div>

                <div class="info-value">
                    ${macro.fearText}
                </div>
            </div>

            <div class="info-card">
                <div class="info-title">
                    UPDATE
                </div>

                <div class="info-value">
                    ${macro.updateTime}
                </div>
            </div>

        </div>
        `;

}

window.onload = () => {

    loadCoin("left");

    loadCoin("right");

};
