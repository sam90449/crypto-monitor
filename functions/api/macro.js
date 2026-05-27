export async function onRequest(){

    async function getJson(url){

        const response =
        await fetch(url,{
            method:"GET",
            headers:{
                "Accept":"application/json"
            }
        });

        return await response.json();
    }

    const btc =
    await getJson(
"https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );

    const eth =
    await getJson(
"https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
    );

    const global =
    await getJson(
"https://api.coingecko.com/api/v3/global"
    );

    const btcPrice =
    parseFloat(btc.price);

    const ethPrice =
    parseFloat(eth.price);

    const marketCap =
    global.data
    .total_market_cap
    .usd;

    const btcDom =
    global.data
    .market_cap_percentage
    .btc;

    let status =
    "中性震盪";

    let icon =
    "🟡";

    if(btcPrice > 90000){

        status =
        "強勢偏多";

        icon =
        "🟢";
    }

    if(btcPrice < 65000){

        status =
        "偏弱震盪";

        icon =
        "🔴";
    }

    return Response.json({

        btc:
        btcPrice,

        eth:
        ethPrice,

        marketCap:
        "~" +
        (
            marketCap /
            1000000000000
        ).toFixed(2)
        + "T",

        btcDom:
        btcDom.toFixed(2)
        + "%",

        status,

        icon,

        updateTime:
        new Date()
        .toLocaleString(
            "en-US",
            {
                timeZone:
                "Asia/Hong_Kong"
            }
        )

    },{
        headers:{
            "Access-Control-Allow-Origin":"*",
            "Cache-Control":"no-store"
        }
    });
}
