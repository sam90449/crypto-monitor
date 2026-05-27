let leftCache = null;
let rightCache = null;
let macroCache = null;

async function safeFetch(url,retry=3){

    for(let i=0;i<=retry;i++){

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

        await new Promise(
            r=>setTimeout(r,400)
        );
    }

    throw new Error("FETCH FAIL");
}

function renderPredictBoxes(containerId,predict){

    const container =
    document.getElementById(
        containerId
    );

    if(!container){

        return;
    }

    const abs =
    Math.abs(predict);

    const isUp =
    predict >= 0;

    const colorClass =
    isUp
    ? "green-box"
    : "red-box";

    const arrow =
    isUp
    ? "▲"
    : "▼";

    const levels = [

        {
            label:"1%",
            active:abs >= 1
        },

        {
            label:"1.5%",
            active:abs >= 1.5
        },

        {
            label:"2%",
            active:abs >= 2
        }
    ];

    container.innerHTML = "";

    for(const lv of levels){

        const line =
        document.createElement("div");

        line.className =
        "predict-line";

        const left =
        document.createElement("div");

        left.className =
        `predict-left ${
            isUp
            ? "up-text"
            : "down-text"
        }`;

        left.textContent =
        `${arrow} ${lv.label}`;

        const right =
        document.createElement("div");

        right.className =
        "predict-right";

        for(let i=0;i<4;i++){

            const square =
            document.createElement("div");

            square.className =
            lv.active
            ? `predict-square ${colorClass}`
            : "predict-square";

            right.appendChild(square);
        }

        line.appendChild(left);

        line.appendChild(right);

        container.appendChild(line);
    }
}

function renderCoin(side,data){

    const priceEl =
    document.getElementById(
        `${side}Price`
    );

    const infoEl =
    document.getElementById(
        `${side}Info`
    );

    const predictEl =
    document.getElementById(
        `${side}Prediction`
    );

    if(priceEl){

        priceEl.textContent =
        `${data.symbol}USDT : ${data.price.toFixed(4)}`;
    }

    renderPredictBoxes(
        `${side}Boxes`,
        data.predict
    );

    if(predictEl){

        predictEl.textContent =
        `1-3H Prediction : ${data.predict.toFixed(2)}% (Target: ${data.target.toFixed(4)})`;
    }

    if(infoEl){

        infoEl.textContent =
`SYMBOL:
${data.symbol}USDT

PRICE:
${data.price.toFixed(4)}

TARGET:
${data.target.toFixed(4)}

5 MA:
${data.ma5.toFixed(4)}

15 MA:
${data.ma15.toFixed(4)}

30 MA:
${data.ma30.toFixed(4)}

5 MA SLOPE:
${data.ma5slope.toFixed(4)}%

15 MA SLOPE:
${data.ma15slope.toFixed(4)}%

30 MA SLOPE:
${data.ma30slope.toFixed(4)}%

FINAL PREDICT:
${data.predict.toFixed(4)}%
`;
    }
}

async function loadCoin(side){

    const input =
    document.getElementById(
        `${side}Input`
    );

    const symbol =
    input.value
    .toUpperCase()
    .trim();

    try{

        const response =
        await safeFetch(
            `/api/coin/${symbol}`
        );

        const data =
        await response.json();

        if(side === "left"){

            leftCache = data;

        }else{

            rightCache = data;
        }

        renderCoin(
            side,
            data
        );

    }catch(e){

        console.log(e);

        const cache =
        side === "left"
        ? leftCache
        : rightCache;

        if(cache){

            renderCoin(
                side,
                cache
            );
        }
    }
}

function renderMacro(data){

    const macro =
    document.getElementById(
        "macroArea"
    );

    if(!macro){

        return;
    }

    macro.innerHTML =
`
<div class="macro-main-title">
BTC 宏觀方向（4-24H）
</div>

<div class="macro-status-row">

<span class="macro-dot">
${data.icon}
</span>

<span class="macro-status">
${data.status}
</span>

</div>

<div class="macro-price">
BTC:
${data.btc.toFixed(2)}
</div>

<div class="macro-price">
ETH:
${data.eth.toFixed(2)}
</div>

<div class="macro-price">
TOTAL MARKET:
${data.marketCap}
</div>

<div class="macro-price">
BTC DOM:
${data.btcDom}
</div>

<div class="macro-price">
HK UPDATE:
${data.updateTime}
</div>
`;
}

async function loadMacro(){

    try{

        const response =
        await safeFetch(
            "/api/macro"
        );

        const data =
        await response.json();

        macroCache = data;

        renderMacro(data);

    }catch(e){

        console.log(e);

        if(macroCache){

            renderMacro(
                macroCache
            );
        }
    }
}

function updateHKTime(){

    const now =
    new Date();

    const hk =
    now.toLocaleString(
        "en-US",
        {
            timeZone:
            "Asia/Hong_Kong"
        }
    );

    const el =
    document.getElementById(
        "updateTime"
    );

    if(el){

        el.textContent =
        `HK UPDATE TIME : ${hk}`;
    }
}

function startSystem(){

    updateHKTime();

    loadCoin("left");

    loadCoin("right");

    loadMacro();

    setInterval(
        updateHKTime,
        1000
    );

    setInterval(()=>{

        loadCoin("left");

        loadCoin("right");

    },15000);

    setInterval(
        loadMacro,
        45000
    );
}

startSystem();
