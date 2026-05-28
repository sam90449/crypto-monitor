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

        const response = await fetch("/api/macro", {
            cache: "no-store"
        });

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

function createBoxes(active, color) {

    let html = "";

    for (let i = 0; i < 4; i++) {

        if (i < active) {

            html += `<div class="small-box ${color}"></div>`;

        } else {

            html += `<div class="small-box"></div>`;

        }

    }

    return html;

}

function renderPredictionBoxes(score) {

    let up1 = 0;
    let up15 = 0;
    let up2 = 0;

    let down1 = 0;
    let down15 = 0;
    let down2 = 0;

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

        <div class="prediction-grid">

            <div class="prediction-row">

                <div class="prediction-label green-text">
                    ▲1%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(up1, "green")}
                </div>

            </div>

            <div class="prediction-row">

                <div class="prediction-label green-text">
                    ▲1.5%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(up15, "green")}
                </div>

            </div>

            <div class="prediction-row">

                <div class="prediction-label green-text">
                    ▲2%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(up2, "green")}
                </div>

            </div>

            <div class="prediction-row">

                <div class="prediction-label red-text">
                    ▼1%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(down1, "red")}
                </div>

            </div>

            <div class="prediction-row">

                <div class="prediction-label red-text">
                    ▼1.5%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(down15, "red")}
                </div>

            </div>

            <div class="prediction-row">

                <div class="prediction-label red-text">
                    ▼2%
                </div>

                <div class="prediction-boxes">
                    ${createBoxes(down2, "red")}
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
        `
        <div class="loading-text">
            Loading...
        </div>
        `;

    document.getElementById(predictionId).innerHTML =
        `
        <div class="loading-text">
            Loading...
        </div>
        `;

    document.getElementById(boxesId).innerHTML =
        "";

    document.getElementById(infoId).innerHTML =
        `
        <div class="loading-text">
            Loading...
        </div>
        `;

    const price =
        await getBinancePrice(symbol);

    const macro =
        await getMacroData();

    if (
        price === "UNSUPPORTED" ||
        price === "API ERROR"
    ) {

        document.getElementById(priceId).innerHTML =
            `
            <div class="coin-symbol">
                ${symbol}/USDT
            </div>

            <div class="coin-price unsupported">
                ${price}
            </div>
            `;

        document.getElementById(predictionId).innerHTML =
            `
            <div class="prediction-title">
                1-3H AI PREDICTION:
            </div>

            <div class="prediction-main">
                中性震盪 🟣
            </div>
            `;

        return;

    }

    let score = 0;

    if (macro.fear <= 25) {

        score -= 1;

    }

    if (macro.dxy !== "N/A") {

        const dxy =
            parseFloat(
                String(macro.dxy)
                    .replace(/[^\d.-]/g, "")
            );

        if (dxy <= 100) {

            score += 1;

        } else {

            score -= 1;

        }

    }

    if (macro.vix !== "N/A") {

        const vix =
            parseFloat(
                String(macro.vix)
                    .replace(/[^\d.-]/g, "")
            );

        if (vix >= 25) {

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
        <div class="coin-symbol">
            ${symbol}/USDT
        </div>

        <div class="coin-price">
            ${price}
        </div>
        `;

    document.getElementById(predictionId).innerHTML =
        `
        <div class="prediction-title">
            1-3H AI PREDICTION:
        </div>

        <div class="prediction-main">
            ${prediction} ${icon}
        </div>
        `;

    document.getElementById(boxesId).innerHTML =
        renderPredictionBoxes(score);

    document.getElementById(infoId).innerHTML =
        `

        <div class="info-grid">

            <div class="info-card">

                <div class="info-title">
                    FEAR:
                </div>

                <div class="info-value">
                    ${macro.fear}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    DXY:
                </div>

                <div class="info-value">
                    ${macro.dxy}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    DOW:
                </div>

                <div class="info-value">
                    ${macro.dow}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    VIX:
                </div>

                <div class="info-value">
                    ${macro.vix}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    GOLD:
                </div>

                <div class="info-value">
                    ${macro.gold}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    US10Y:
                </div>

                <div class="info-value">
                    ${macro.us10y}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    MARKET FEAR:
                </div>

                <div class="info-value">
                    ${macro.fearText}
                </div>

            </div>

            <div class="info-card">

                <div class="info-title">
                    UPDATE:
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
