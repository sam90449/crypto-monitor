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
"https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
        );

        const ethData =
        await getJson(
"https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT"
        );

        const btcPrice =
        parseFloat(
            btcData.lastPrice
        );

        const ethPrice =
        parseFloat(
            ethData.lastPrice
        );

        const btcVolume =
        parseFloat(
            btcData.quoteVolume
        );

        const btcChange =
        parseFloat(
            btcData.priceChangePercent
        );

        let status =
        "中性震盪";

        let icon =
        "🟡";

        if(btcChange >= 2){

            status =
            "強勢偏多";

            icon =
            "🟢";
        }

        if(btcChange <= -2){

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

            btcVolume:
            (
                btcVolume /
                1000000000
            ).toFixed(2)
            + "B",

            btcChange:
            btcChange.toFixed(2)
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
