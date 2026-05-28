async function getPrice(symbol){

    try{

        const res = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
        );

        const data = await res.json();

        return parseFloat(data.price).toFixed(2);

    }catch(e){

        return "LOAD ERROR";
    }
}

function getPrediction(price){

    price = parseFloat(price);

    if(isNaN(price)){
        return "LOAD ERROR";
    }

    if(price > 50000){
        return "輕微看跌 ●";
    }

    if(price > 1000){
        return "中性震盪 ●";
    }

    return "強烈看跌 ▼";
}

async function loadCoin(side){

    const input =
        document.getElementById(`${side}Input`);

    const symbol =
        input.value.toUpperCase();

    const content =
        document.getElementById(`${side}Content`);

    content.querySelector(".symbol").innerText =
        `${symbol}/USDT`;

    content.querySelector(".price").innerText =
        "Loading...";

    const price = await getPrice(symbol);

    content.querySelector(".price").innerText =
        price;

    const prediction =
        getPrediction(price);

    content.querySelector(".prediction").innerText =
        prediction;

    const now = new Date();

    const hk = now.toLocaleString(
        "en-US",
        {
            timeZone:"Asia/Hong_Kong"
        }
    );

    document.getElementById(
        `update-${side}`
    ).innerText = hk;

    document.getElementById(
        `feartext-${side}`
    ).innerText = "Extreme Fear";

    document.getElementById(
        `fear-${side}`
    ).innerText = "22";

    document.getElementById(
        `dxy-${side}`
    ).innerText = "99.33";

    document.getElementById(
        `dow-${side}`
    ).innerText = "50644.28";

    document.getElementById(
        `vix-${side}`
    ).innerText = "16.72";

    document.getElementById(
        `gold-${side}`
    ).innerText = "4419.80";

    document.getElementById(
        `us10-${side}`
    ).innerText = "0.45";
}

function updateMainTime(){

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
        `HK UPDATE TIME\n${hk}`;
}

setInterval(updateMainTime,1000);

updateMainTime();

loadCoin("left");
loadCoin("right");
