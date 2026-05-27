async function fetchYahooSymbol(symbol){

    try{

        const url =
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

        const response =
        await fetch(url);

        const data =
        await response.json();

        const result =
        data.chart.result[0];

        const price =
        result.meta.regularMarketPrice;

        const prev =
        result.meta.previousClose;

        const change =
        ((price-prev)/prev)*100;

        return {
            price,
            change
        };

    }
    catch(err){

        return {
            price:0,
            change:0
        };

    }

}

async function fetchBTCVolume(){

    try{

        const url =
        `https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`;

        const response =
        await fetch(url);

        const data =
        await response.json();

        return parseFloat(data.quoteVolume);

    }
    catch(err){

        return 0;

    }

}

function macroDirection(score){

    if(score >= 3){
        return "偏強";
    }

    if(score <= -3){
        return "偏弱";
    }

    return "中性震盪";

}

async function updateMacro(){

    const dxy =
    await fetchYahooSymbol("DX-Y.NYB");

    const nasdaq =
    await fetchYahooSymbol("^IXIC");

    const us10y =
    await fetchYahooSymbol("^TNX");

    const vix =
    await fetchYahooSymbol("^VIX");

    const gold =
    await fetchYahooSymbol("GC=F");

    const btcVolume =
    await fetchBTCVolume();

    let score = 0;

    if(dxy.change < 0){
        score += 1;
    }
    else{
        score -= 1;
    }

    if(nasdaq.change > 0){
        score += 1;
    }
    else{
        score -= 1;
    }

    if(us10y.change < 0){
        score += 1;
    }
    else{
        score -= 1;
    }

    if(vix.change < 0){
        score += 1;
    }
    else{
        score -= 1;
    }

    if(gold.change > 0){
        score += 1;
    }
    else{
        score -= 1;
    }

    const direction =
    macroDirection(score);

    const html =

`
<div class="macro-panel">

<div class="macro-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-score">
宏觀方向 :
${direction}
|
SCORE :
${score}
</div>

<div class="macro-item">
DXY美元指數 :
${dxy.price.toFixed(2)}
(${dxy.change.toFixed(2)}%)
</div>

<div class="macro-item">
NASDAQ :
${nasdaq.price.toFixed(2)}
(${nasdaq.change.toFixed(2)}%)
</div>

<div class="macro-item">
美債10年期 :
${us10y.price.toFixed(2)}
(${us10y.change.toFixed(2)}%)
</div>

<div class="macro-item">
VIX恐慌指數 :
${vix.price.toFixed(2)}
(${vix.change.toFixed(2)}%)
</div>

<div class="macro-item">
黃金 :
${gold.price.toFixed(2)}
(${gold.change.toFixed(2)}%)
</div>

<div class="macro-item">
BTC成交量 :
${parseInt(btcVolume).toLocaleString()}
</div>

</div>
`;

    document.getElementById("macroArea")
    .innerHTML = html;

}

setInterval(updateMacro,300000);

updateMacro();
