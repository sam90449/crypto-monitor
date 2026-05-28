const BINANCE_BASE = "https://api.binance.com/api/v3";

const MACRO = {
    dxy: 99.35,
    dow: 50644.28,
    us10y: 4.45,
    vix: 16.68,
    gold: 3315.10
};

async function fetchPrice(symbol){

    const res = await fetch(
        `${BINANCE_BASE}/ticker/price?symbol=${symbol}USDT`
    );

    const data = await res.json();

    return parseFloat(data.price);
}

async function fetchKlines(symbol, interval="15m", limit=60){

    const res = await fetch(
        `${BINANCE_BASE}/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
    );

    return await res.json();
}

function calcMA(klines, period){

    const closes = klines
        .slice(-period)
        .map(k => parseFloat(k[4]));

    const sum = closes.reduce((a,b)=>a+b,0);

    return sum / closes.length;
}

function calcVolumeMA(klines, period){

    const vols = klines
        .slice(-period)
        .map(k => parseFloat(k[5]));

    const sum = vols.reduce((a,b)=>a+b,0);

    return sum / vols.length;
}

function calcMomentum(price, ma5, ma15, ma30){

    let score = 0;

    if(price > ma5) score++;
    else score--;

    if(ma5 > ma15) score++;
    else score--;

    if(ma15 > ma30) score++;
    else score--;

    return score;
}

function getPrediction(score){

    if(score >= 3){
        return {
            text:"強烈看升 ▲",
            color:"#00ff99",
            active:[
                "up1",
                "up15",
                "up2"
            ]
        };
    }

    if(score >= 1){
        return {
            text:"輕微看升 ●",
            color:"#00ffff",
            active:[
                "up1"
            ]
        };
    }

    if(score <= -3){
        return {
            text:"強烈看跌 ▼",
            color:"#ff3355",
            active:[
                "down1",
                "down15",
                "down2"
            ]
        };
    }

    if(score <= -1){
        return {
            text:"輕微看跌 ●",
            color:"#ffaa00",
            active:[
                "down1"
            ]
        };
    }

    return {
        text:"中性震盪 ◎",
        color:"yellow",
        active:[]
    };
}

function clearMatrix(panel){

    const cells = panel.querySelectorAll(".matrix-cell");

    cells.forEach(c=>{
        c.classList.remove(
            "active-green",
            "active-red"
        );
    });
}

function activateMatrix(panel, active){

    clearMatrix(panel);

    const map = {
        up1:0,
        up15:4,
        up2:8,
        down1:12,
        down15:16,
        down2:20
    };

    active.forEach(a=>{

        const index = map[a];

        if(index !== undefined){

            const cell =
                panel.querySelectorAll(".matrix-cell")[index];

            if(a.includes("down")){
                cell.classList.add("active-red");
            }else{
                cell.classList.add("active-green");
            }
        }
    });
}

function getMacroScore(){

    let score = 0;

    if(MACRO.dxy > 99) score--;
    else score++;

    if(MACRO.vix > 15) score--;
    else score++;

    if(MACRO.dow > 50000) score++;
    else score--;

    if(MACRO.gold > 3200) score--;
    else score++;

    return score;
}

function renderMacro(){

    const score = getMacroScore();

    let text = "中性震盪";
    let color = "yellow";

    if(score >= 2){
        text = "偏強看升";
        color = "#00ff99";
    }

    if(score <= -2){
        text = "偏弱看跌";
        color = "#ff3355";
    }

    document.querySelector(".macro-score").innerHTML =
        `◎ 宏觀方向：<span style="color:${color}">${text}</span> | SCORE: ${score}`;

    document.querySelector(".macro-box").innerHTML = `
        <div class="macro-title">
            BTC 宏觀方向（4-24小時） + 短線預測（1-3小時）
        </div>

        <div class="macro-score">
            ◎ 宏觀方向：
            <span style="color:${color}">
                ${text}
            </span>
            | SCORE: ${score}
        </div>

        <div class="macro-info">
            DXY美元指數: ${MACRO.dxy}
        </div>

        <div class="macro-info green">
            道瓊斯指數: ${MACRO.dow}
        </div>

        <div class="macro-info green">
            美債10年期: ${MACRO.us10y}%
        </div>

        <div class="macro-info red">
            恐慌指數(VIX): ${MACRO.vix}
        </div>

        <div class="macro-info red">
            黃金: ${MACRO.gold}
        </div>
    `;
}

async function loadCoin(side){

    try{

        const input =
            document.getElementById(`${side}Input`);

        const symbol =
            input.value
                .toUpperCase()
                .replace("USDT","");

        const price =
            await fetchPrice(symbol);

        const klines =
            await fetchKlines(symbol);

        const ma5 =
            calcMA(klines,5);

        const ma15 =
            calcMA(klines,15);

        const ma30 =
            calcMA(klines,30);

        const volumeMA =
            calcVolumeMA(klines,20);

        const score =
            calcMomentum(
                price,
                ma5,
                ma15,
                ma30
            );

        const pred =
            getPrediction(score);

        document.getElementById(
            `${side}Symbol`
        ).innerText =
            `${symbol}USDT : ${price.toFixed(5)}`;

        const predDiv =
            document.getElementById(
                `${side}Prediction`
            );

        predDiv.innerText =
            `1-3H AI PREDICTION：${pred.text}`;

        predDiv.style.color =
            pred.color;

        document.getElementById(
            `${side}Info`
        ).innerText =

`SYMBOL: ${symbol}USDT

PRICE: ${price.toFixed(5)}

5 MA: ${ma5.toFixed(5)}
15 MA: ${ma15.toFixed(5)}
30 MA: ${ma30.toFixed(5)}

VOL MA20:
${Math.round(volumeMA).toLocaleString()}

SCORE:
${score}`;

        const panel =
            predDiv.parentElement;

        activateMatrix(
            panel,
            pred.active
        );

    }catch(e){

        document.getElementById(
            `${side}Prediction`
        ).innerText =
            "LOAD ERROR";
    }
}

function updateTime(){

    const now = new Date();

    const hk = now.toLocaleString(
        "en-US",
        {
            timeZone:"Asia/Hong_Kong"
        }
    );

    document.getElementById(
        "updateTime"
    ).innerText =
        `HK UPDATE TIME : ${hk}`;
}

async function autoRefresh(){

    await loadCoin("left");

    await loadCoin("right");

    renderMacro();
}

setInterval(updateTime,1000);

setInterval(autoRefresh,15000);

updateTime();

autoRefresh();
