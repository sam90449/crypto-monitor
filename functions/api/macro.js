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

        const fgData =
        await getJson(
"https://api.alternative.me/fng/"
        );

        const globalData =
        await getJson(
"https://api.alternative.me/v2/global/"
        );

        const btcPrice =
        parseFloat(
            btcData.price
        );

        const ethPrice =
        parseFloat(
            ethData.price
        );

        const totalCap =
        globalData
        .data
        .quotes
        .USD
        .total_market_cap;

        const btcDom =
        globalData
        .data
        .bitcoin_dominance_percentage;

        const fear =
        fgData
        .data[0]
        .value;

        const fearText =
        fgData
        .data[0]
        .value_classification;

        let status =
        "中性震盪";

        let icon =
        "🟡";

        if(fear >= 65){

            status =
            "市場偏貪婪";

            icon =
            "🟢";
        }

        if(fear <= 35){

            status =
            "市場偏恐慌";

            icon =
            "🔴";
        }

        return Response.json({

            btc:
            btcPrice,

            eth:
            ethPrice,

            totalCap:
            (
                totalCap /
                1000000000000
            ).toFixed(2)
            + "T",

            btcDom:
            btcDom.toFixed(2)
            + "%",

            fear:
            fear,

            fearText:
            fearText,

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
