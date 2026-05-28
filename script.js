const BINANCE_BASE = "https://api.binance.com/api/v3";

const MACRO_API = {
    fear: "https://api.alternative.me/fng/?limit=1"
};

const DEFAULT_MACRO = {
    dxy: 99.35,
    dow: 50644.28,
    us10y: 4.45,
    vix: 16.68,
    gold: 3315.10
};

let MACRO = { ...DEFAULT_MACRO };

async function safeFetch(url){
    try{
        const res = await fetch(url);

        if(!res.ok){
            throw new Error("FETCH ERROR");
        }

        return await res.json();

    }catch(err){
        console.error(err);
        return null;
    }
}

async function fetchPrice(symbol){

    try{

        const data = await safeFetch(
            `${BINANCE_BASE}/ticker/price?symbol=${symbol.toUpperCase()}USDT`
        );

        if(!data || !data.price){
            return 0;
        }

        return parseFloat(data.price);

    }catch(e){

        console.error(e);
        return 0;
    }
}

async function fetch24h(symbol){

    try{

        const data = await safeFetch(
            `${BINANCE_BASE}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
        );

        if(!data){
            return null;
        }

        return data;

    }catch(e){

        console.error(e);
        return null;
    }
}

async function fetchKlines(symbol, interval="15m", limit=120){

    try{

        const data = await safeFetch(
            `${BINANCE_BASE}/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=${limit}`
        );

        if(!data || !Array.isArray(data)){
            return [];
        }

        return data;

    }catch(e){

        console.error(e);
        return [];
    }
}

function calcMA(klines, period){

    try{

        const closes = klines
            .slice(-period)
            .map(k => parseFloat(k[4]));

        if(closes.length === 0){
            return 0;
        }

        const sum = closes.reduce((a,b)=>a+b,0);

        return sum / closes.length;

    }catch(e){

        console.error(e);
        return 0;
    }
}

function calcVolumeMA(klines, period){

    try{

        const volumes = klines
            .slice(-period)
            .map(k => parseFloat(k[5]));

        if(volumes.length === 0){
            return 0;
        }

        const sum = volumes.reduce((a,b)=>a+b,0);

        return sum / volumes.length;

    }catch(e){

        console.error(e);
        return 0;
    }
}

function getLatestVolume(klines){

    try{

        if(klines.length === 0){
            return 0;
        }

        return parseFloat(
            klines[klines.length - 1][5]
        );

    }catch(e){

        console.error(e);
        return 0;
    }
}

function calcRSI(klines, period = 14){

    try{

        const closes = klines.map(
            k => parseFloat(k[4])
        );

        if(closes.length < period + 1){
            return 50;
        }

        let gains = 0;
        let losses = 0;

        for(let i = closes.length - period; i < closes.length; i++){

            const diff = closes[i] - closes[i - 1];

            if(diff >= 0){
                gains += diff;
            }else{
                losses += Math.abs(diff);
            }
        }

        if(losses === 0){
            return 100;
        }

        const rs = gains / losses;

        return 100 - (100 / (1 + rs));

    }catch(e){

        console.error(e);
        return 50;
    }
}

function calcMomentum(price, ma5, ma15, ma30){

    let score = 0;

    if(price > ma5){
        score += 1;
    }else{
        score -= 1;
    }

    if(ma5 > ma15){
        score += 1;
    }else{
        score -= 1;
    }

    if(ma15 > ma30){
        score += 1;
    }else{
        score -= 1;
    }

    return score;
}

function calcVolumeScore(currentVol, volMA){

    if(currentVol > volMA * 2){
        return 2;
    }

    if(currentVol > volMA * 1.3){
        return 1;
    }

    if(currentVol < volMA * 0.7){
        return -1;
    }

    return 0;
}

function calcRSIScore(rsi){

    if(rsi >= 75){
        return -2;
    }

    if(rsi >= 65){
        return -1;
    }

    if(rsi <= 25){
        return 2;
    }

    if(rsi <= 35){
        return 1;
    }

    return 0;
}

function getMacroScore(){

    let score = 0;

    if(MACRO.dxy > 104){
        score -= 2;
    }else if(MACRO.dxy > 100){
        score -= 1;
    }else{
        score += 1;
    }

    if(MACRO.vix > 25){
        score -= 2;
    }else if(MACRO.vix > 18){
        score -= 1;
    }else{
        score += 1;
    }

    if(MACRO.gold > 3400){
        score -= 1;
    }

    if(MACRO.dow > 50000){
        score += 1;
    }else{
        score -= 1;
    }

    return score;
}

function getPrediction(score){

    if(score >= 6){

        return {
            text: "強烈看升 ▲",
            color: "#00ff99",
            active: [
                "up1",
                "up15",
                "up2"
            ]
        };
    }

    if(score >= 3){

        return {
            text: "輕微看升 ●",
            color: "#00ffff",
            active: [
                "up1",
                "up15"
            ]
        };
    }

    if(score <= -6){

        return {
            text: "強烈看跌 ▼",
            color: "#ff3355",
            active: [
                "down1",
                "down15",
                "down2"
            ]
        };
    }

    if(score <= -3){

        return {
            text: "輕微看跌 ●",
            color: "#ffaa00",
            active: [
                "down1",
                "down15"
            ]
        };
    }

    return {
        text: "中性震盪 ◎",
        color: "yellow",
        active: []
    };
}

function clearMatrix(panel){

    const cells = panel.querySelectorAll(".matrix-cell");

    cells.forEach(cell => {

        cell.classList.remove(
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

    active.forEach(a => {

        const index = map[a];

        if(index === undefined){
            return;
        }

        const cell = panel.querySelectorAll(".matrix-cell")[index];

        if(!cell){
            return;
        }

        if(a.includes("down")){
            cell.classList.add("active-red");
        }else{
            cell.classList.add("active-green");
        }
    });
}

async function fetchFearGreed(){

    try{

        const data = await safeFetch(MACRO_API.fear);

        if(
            data &&
            data.data &&
            data.data.length > 0
        ){

            return {
                value: data.data[0].value,
                text: data.data[0].value_classification
            };
        }

        return {
            value: "N/A",
            text: "UNKNOWN"
        };

    }catch(e){

        console.error(e);

        return {
            value: "N/A",
            text: "UNKNOWN"
        };
    }
}

function updateHKTime(){

    const now = new Date();

    const hk = now.toLocaleString(
        "en-GB",
        {
            timeZone:"Asia/Hong_Kong",
            hour12:false
        }
    );

    const el = document.getElementById("updateTime");

    if(el){
        el.innerText = `HK UPDATE TIME : ${hk}`;
    }
}

function formatNumber(n){

    if(!isFinite(n)){
        return "0";
    }

    return Number(n).toLocaleString(
        "en-US",
        {
            maximumFractionDigits:4
        }
    );
}

async function analyzeCoin(side){

    try{

        const input = document.getElementById(`${side}Input`);

        if(!input){
            return;
        }

        const symbol = input.value
            .replace("USDT","")
            .toUpperCase()
            .trim();

        const panel = document.getElementById(`${side}Panel`);

        const priceEl = document.getElementById(`${side}Price`);
        const symbolEl = document.getElementById(`${side}Symbol`);
        const predictionEl = document.getElementById(`${side}Prediction`);
        const infoEl = document.getElementById(`${side}Info`);

        symbolEl.innerText = `${symbol}USDT`;
        priceEl.innerText = "LOADING...";

        const [
            price,
            klines5m,
            klines15m,
            klines30m,
            stat24h,
            fearData
        ] = await Promise.all([
            fetchPrice(symbol),
            fetchKlines(symbol, "5m", 120),
            fetchKlines(symbol, "15m", 120),
            fetchKlines(symbol, "30m", 120),
            fetch24h(symbol),
            fetchFearGreed()
        ]);

        if(price <= 0){

            priceEl.innerText = "LOAD ERROR";

            predictionEl.innerText = "API ERROR";

            return;
        }

        priceEl.innerText = formatNumber(price);

        const ma5 = calcMA(klines5m, 5);
        const ma15 = calcMA(klines15m, 15);
        const ma30 = calcMA(klines30m, 30);

        const volumeMA = calcVolumeMA(klines15m, 20);

        const currentVolume = getLatestVolume(klines15m);

        const rsi = calcRSI(klines15m);

        const momentumScore = calcMomentum(
            price,
            ma5,
            ma15,
            ma30
        );

        const volumeScore = calcVolumeScore(
            currentVolume,
            volumeMA
        );

        const rsiScore = calcRSIScore(rsi);

        const macroScore = getMacroScore();

        const totalScore =
            momentumScore +
            volumeScore +
            rsiScore +
            macroScore;

        const prediction = getPrediction(totalScore);

        predictionEl.innerText = prediction.text;
        predictionEl.style.color = prediction.color;

        activateMatrix(panel, prediction.active);

        const change24h = stat24h
            ? parseFloat(stat24h.priceChangePercent)
            : 0;

        const high24h = stat24h
            ? parseFloat(stat24h.highPrice)
            : 0;

        const low24h = stat24h
            ? parseFloat(stat24h.lowPrice)
            : 0;

        infoEl.innerText =
`SYMBOL : ${symbol}USDT
PRICE : ${formatNumber(price)}
24H % : ${change24h.toFixed(2)}%
24H HIGH : ${formatNumber(high24h)}
24H LOW : ${formatNumber(low24h)}

5M MA : ${formatNumber(ma5)}
15M MA : ${formatNumber(ma15)}
30M MA : ${formatNumber(ma30)}

VOLUME : ${formatNumber(currentVolume)}
VOL MA : ${formatNumber(volumeMA)}

RSI : ${rsi.toFixed(2)}
MOMENTUM SCORE : ${momentumScore}
VOLUME SCORE : ${volumeScore}
RSI SCORE : ${rsiScore}
MACRO SCORE : ${macroScore}

TOTAL SCORE : ${totalScore}

FEAR : ${fearData.value}
FEAR TEXT : ${fearData.text}

DXY : ${MACRO.dxy}
DOW : ${MACRO.dow}
VIX : ${MACRO.vix}
GOLD : ${MACRO.gold}
US10Y : ${MACRO.us10y}`;

    }catch(e){

        console.error(e);
    }
}

async function renderMacroBox(){

    const macroScore = getMacroScore();

    const el = document.getElementById("macroScore");

    if(!el){
        return;
    }

    let text = "";

    if(macroScore >= 2){
        text = "MACRO RISK-ON ▲";
    }else if(macroScore <= -2){
        text = "MACRO RISK-OFF ▼";
    }else{
        text = "MACRO NEUTRAL ◎";
    }

    el.innerText =
`${text}

DXY : ${MACRO.dxy}
DOW : ${MACRO.dow}
VIX : ${MACRO.vix}
GOLD : ${MACRO.gold}
US10Y : ${MACRO.us10y}`;
}

async function refreshAll(){

    await Promise.all([
        analyzeCoin("left"),
        analyzeCoin("right"),
        renderMacroBox()
    ]);
}

function bindButtons(){

    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");

    if(leftBtn){
        leftBtn.onclick = ()=>{
            analyzeCoin("left");
        };
    }

    if(rightBtn){
        rightBtn.onclick = ()=>{
            analyzeCoin("right");
        };
    }
}

updateHKTime();

setInterval(updateHKTime, 1000);

bindButtons();

refreshAll();

setInterval(refreshAll, 30000);
