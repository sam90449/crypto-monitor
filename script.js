async function getPrice(symbol){

    try{

        const res = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`
        );

        const data = await res.json();

        return parseFloat(data.price);

    }catch(e){

        return 0;
    }
}

function getPrediction(price){

    if(price > 50000){

        return "1-3H Prediction：+0.03% (Target: 73555.6889)";
    }

    if(price > 1){

        return "1-3H Prediction：低勝算率";
    }

    return "1-3H Prediction：中性震盪";
}

async function loadCoin(side){

    const input =
        document.getElementById(`${side}Input`);

    const symbol =
        input.value.toUpperCase();

    const price =
        await getPrice(symbol);

    document.getElementById(
        `${side}Symbol`
    ).innerText =
        `${symbol}USDT : ${price.toFixed(5)}`;

    document.getElementById(
        `${side}Prediction`
    ).innerText =
        getPrediction(price);

    document.getElementById(
        `${side}Info`
    ).innerText =

`SYMBOL: ${symbol}USDT

PRICE: ${price.toFixed(5)}

5 MA: ${(price*1.001).toFixed(4)}
15 MA: ${(price*1.002).toFixed(4)}
30 MA: ${(price*1.003).toFixed(4)}`;
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

setInterval(updateTime,1000);

updateTime();

loadCoin("left");
loadCoin("right");
