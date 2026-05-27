let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url,retry=3){

    for(let i=0;i<retry;i++){

        try{

            const response =
            await fetch(url,{
                method:"GET",
                headers:{
                    "Accept":"application/json"
                },
                cache:"no-store"
            });

            if(response.ok){

                return response;
            }

        }catch(e){

            console.log(e);
        }

        await new Promise(r=>setTimeout(r,800));
    }

    throw new Error("FETCH FAIL");
}

async function fetchCoin(symbol){

    try{

        const response =
        await safeFetch(
            `/api/coin/${symbol}`
        );

        return await response.json();

    }catch(e){

        return {
            error:e.toString()
        };
    }
}

async function fetchMacro(){

    try{

        const response =
        await safeFetch(
            "/api/macro"
        );

        return await response.json();

    }catch(e){

        return {
            error:e.toString()
        };
    }
}

function setText(id,text){

    const el =
    document.getElementById(id);

    if(el){

        el.innerText = text;
    }
}

function setHTML(id,html){

    const el =
    document.getElementById(id);

    if(el){

        el.innerHTML = html;
    }
}

function predictColor(value){

    if(value > 0){

        return "#00ff99";
    }

    if(value < 0){

        return "#ff4d6d";
    }

    return "#ffffff";
}

function updateCoinCard(side,data){

    if(!data || data.error){

        setText(
            `${side}-card`,
            "LOAD FAIL"
        );

        return;
    }

    const predict =
    parseFloat(data.predict);

    const color =
    predictColor(predict);

    const html = `

<div class="coin-box">

<div class="coin-title">
${data.symbol}USDT
</div>

<div class="coin-price">
${Number(data.price).toFixed(4)}
</div>

<div class="coin-target">
TARGET:
${Number(data.target).toFixed(4)}
</div>

<div class="coin-ma">
5 MA:
${Number(data.ma5).toFixed(4)}
</div>

<div class="coin-ma">
15 MA:
${Number(data.ma15).toFixed(4)}
</div>

<div class="coin-ma">
30 MA:
${Number(data.ma30).toFixed(4)}
</div>

<div class="coin-ma">
5 MA SLOPE:
${Number(data.ma5slope).toFixed(4)}%
</div>

<div class="coin-ma">
15 MA SLOPE:
${Number(data.ma15slope).toFixed(4)}%
</div>

<div class="coin-ma">
30 MA SLOPE:
${Number(data.ma30slope).toFixed(4)}%
</div>

<div 
class="predict"
style="color:${color}"
>
FINAL PREDICT:
${Number(data.predict).toFixed(4)}%
</div>

</div>

`;

    setHTML(
        `${side}-card`,
        html
    );
}

function updateMacro(data){

    if(!data || data.error){

        setHTML(
            "macro-card",
            `
<div class="macro-box">
MACRO LOAD FAIL
</div>
`
        );

        return;
    }

    const html = `

<div class="macro-box">

<div class="macro-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-status">
${data.icon}
${data.status}
</div>

<div class="macro-item">
BTC:
${data.btc}
</div>

<div class="macro-item">
ETH:
${data.eth}
</div>

<div class="macro-item">
TOTAL MARKET:
${data.totalCap}
</div>

<div class="macro-item">
BTC DOM:
${data.btcDom}
</div>

<div class="macro-item">
FEAR & GREED:
${data.fear}
 (${data.fearText})
</div>

<div class="macro-item">
HK UPDATE:
${data.updateTime}
</div>

</div>

`;

    setHTML(
        "macro-card",
        html
    );
}

async function loadLeftCoin(){

    const symbol =
    document
    .getElementById("left-input")
    .value
    .trim()
    .toUpperCase();

    setText(
        "left-card",
        "Loading..."
    );

    const data =
    await fetchCoin(symbol);

    leftCache = data;

    updateCoinCard(
        "left",
        data
    );
}

async function loadRightCoin(){

    const symbol =
    document
    .getElementById("right-input")
    .value
    .trim()
    .toUpperCase();

    setText(
        "right-card",
        "Loading..."
    );

    const data =
    await fetchCoin(symbol);

    rightCache = data;

    updateCoinCard(
        "right",
        data
    );
}

async function loadMacro(){

    setText(
        "macro-card",
        "Loading..."
    );

    const data =
    await fetchMacro();

    macroCache = data;

    updateMacro(data);
}

document
.getElementById("left-load")
.addEventListener(
    "click",
    loadLeftCoin
);

document
.getElementById("right-load")
.addEventListener(
    "click",
    loadRightCoin
);

loadLeftCoin();

loadRightCoin();

loadMacro();

setInterval(()=>{

    loadLeftCoin();

    loadRightCoin();

    loadMacro();

},60000);
