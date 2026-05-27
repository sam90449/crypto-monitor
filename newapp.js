async function getData(url){

    try{

        const response =
        await fetch(
            url + "?t=" + Date.now()
        );

        return await response.json();

    }catch(e){

        console.log(e);

        return {
            error:true
        };
    }
}

function num(v,d=4){

    const n =
    parseFloat(v);

    if(isNaN(n)){

        return "0";
    }

    return n.toFixed(d);
}

function renderCoin(side,data){

    const card =
    document.getElementById(
        side + "-card"
    );

    if(!card){

        return;
    }

    if(data.error){

        card.innerHTML =
        `
        <div style="
        color:red;
        font-size:30px;
        ">
        LOAD FAIL
        </div>
        `;

        return;
    }

    const predict =
    parseFloat(
        data.predict
    );

    let color =
    "#ffffff";

    if(predict > 0){

        color = "#00ff99";
    }

    if(predict < 0){

        color = "#ff5577";
    }

    card.innerHTML =
    `

<div style="
font-size:34px;
font-weight:bold;
margin-bottom:20px;
">
${data.symbol}USDT
</div>

<div>
PRICE:
${num(data.price)}
</div>

<br>

<div>
TARGET:
${num(data.target)}
</div>

<br>

<div>
5 MA:
${num(data.ma5)}
</div>

<br>

<div>
15 MA:
${num(data.ma15)}
</div>

<br>

<div>
30 MA:
${num(data.ma30)}
</div>

<br>

<div>
5 MA SLOPE:
${num(data.ma5slope)}%
</div>

<br>

<div>
15 MA SLOPE:
${num(data.ma15slope)}%
</div>

<br>

<div>
30 MA SLOPE:
${num(data.ma30slope)}%
</div>

<br>

<div style="
font-size:30px;
font-weight:bold;
color:${color};
">
FINAL PREDICT:
${num(data.predict)}%
</div>

`;
}

function renderMacro(data){

    const card =
    document.getElementById(
        "macro-card"
    );

    if(!card){

        return;
    }

    if(data.error){

        card.innerHTML =
        `
        <div style="
        color:red;
        font-size:30px;
        ">
        MACRO LOAD FAIL
        </div>
        `;

        return;
    }

    card.innerHTML =
    `

<div style="
font-size:42px;
font-weight:bold;
margin-bottom:25px;
">
BTC 宏觀方向（4-24H）
</div>

<div style="
font-size:36px;
margin-bottom:25px;
">
${data.icon}
${data.status}
</div>

<div style="
font-size:28px;
margin-bottom:18px;
">
BTC:
${num(data.btc,2)}
</div>

<div style="
font-size:28px;
margin-bottom:18px;
">
ETH:
${num(data.eth,2)}
</div>

<div style="
font-size:28px;
margin-bottom:18px;
">
TOTAL MARKET:
${data.totalCap}
</div>

<div style="
font-size:28px;
margin-bottom:18px;
">
BTC DOM:
${data.btcDom}
</div>

<div style="
font-size:28px;
margin-bottom:18px;
">
FEAR & GREED:
${data.fear}
 (${data.fearText})
</div>

<div style="
font-size:28px;
">
HK UPDATE:
${data.updateTime}
</div>

`;
}

async function loadLeft(){

    const symbol =
    document
    .getElementById(
        "left-input"
    )
    .value
    .trim()
    .toUpperCase();

    const data =
    await getData(
        `/api/coin/${symbol}`
    );

    renderCoin(
        "left",
        data
    );
}

async function loadRight(){

    const symbol =
    document
    .getElementById(
        "right-input"
    )
    .value
    .trim()
    .toUpperCase();

    const data =
    await getData(
        `/api/coin/${symbol}`
    );

    renderCoin(
        "right",
        data
    );
}

async function loadMacro(){

    const data =
    await getData(
        "/api/macro"
    );

    renderMacro(data);
}

window.onload = async function(){

    document
    .getElementById(
        "left-load"
    )
    .onclick =
    loadLeft;

    document
    .getElementById(
        "right-load"
    )
    .onclick =
    loadRight;

    await loadLeft();

    await loadRight();

    await loadMacro();

    setInterval(async()=>{

        await loadLeft();

        await loadRight();

        await loadMacro();

    },60000);
};
