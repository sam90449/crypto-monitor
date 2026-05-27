export async function onRequest(){

    async function getJson(url){

        const response =
        await fetch(
            url,
            {
                method:"GET",
                headers:{
                    "Accept":"application/json"
                }
            }
        );

        if(!response.ok){

            throw new Error(
                "FETCH FAIL"
            );
        }

        return await response.json();
    }

    try{

        const btcData =
        await getJson(
"https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );

        const ethData =
        await getJson(
"https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
        );

        const globalData =
        await getJson(
"https://api.coingecko.com/api/v3/global"
        );

        const btcPrice =
        parseFloat(
            btcData.price
        );

        const ethPrice =
        parseFloat(
            ethData.price
        );

        const marketCap =
        globalData
        .data
        .total_market_cap
        .usd;

        const btcDom =
        globalData
        .data
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

    }catch(e){

        return Response.json({

            error:
            e.toString()

        },{
            status:500
        });
    }
}
