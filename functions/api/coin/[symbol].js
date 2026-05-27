export async function onRequest(context){

    const symbol =
    context.params.symbol.toUpperCase();

    async function safeFetch(url,retry=3){

        for(let i=0;i<=retry;i++){

            try{

                const response =
                await fetch(url,{
                    method:"GET",
                    headers:{
                        "Accept":"application/json"
                    }
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

    function calcMA(closes,length){

        const result = [];

        for(let i=0;i<closes.length;i++){

            if(i < length-1){

                result.push(null);

            }else{

                const slice =
                closes.slice(
                    i-length+1,
                    i+1
                );

                const avg =
                slice.reduce(
                    (a,b)=>a+b,
                    0
                ) / length;

                result.push(avg);
            }
        }

        return result;
    }

    function calcSlope(values){

        if(values.length < 2){

            return 0;
        }

        const first =
        values[0];

        const last =
        values[
            values.length-1
        ];

        if(first === 0){

            return 0;
        }

        return (
            (
                last-first
            ) / first
        ) * 100;
    }

    const response =
    await safeFetch(
`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=5m&limit=60`
    );

    const klines =
    await response.json();

    if(
        !Array.isArray(klines)
    ){

        return Response.json({

            error:"INVALID BINANCE DATA"

        },{
            status:500
        });
    }

    const closes =
    klines.map(
        k=>parseFloat(k[4])
    );

    const price =
    closes[
        closes.length-1
    ];

    const ma5 =
    calcMA(closes,5);

    const ma15 =
    calcMA(closes,15);

    const ma30 =
    calcMA(closes,30);

    const ma5slope =
    calcSlope(
        ma5
        .slice(-5)
        .filter(v=>v)
    );

    const ma15slope =
    calcSlope(
        ma15
        .slice(-5)
        .filter(v=>v)
    );

    const ma30slope =
    calcSlope(
        ma30
        .slice(-5)
        .filter(v=>v)
    );

    let predict =
        ma5slope * 0.5 +
        ma15slope * 0.3 +
        ma30slope * 0.2;

    if(isNaN(predict)){

        predict = 0;
    }

    if(predict > 2){

        predict = 2;
    }

    if(predict < -2){

        predict = -2;
    }

    const target =
    price * (
        1 + predict / 100
    );

    return Response.json({

        symbol,

        price,

        target,

        predict,

        ma5:
        ma5[
            ma5.length-1
        ],

        ma15:
        ma15[
            ma15.length-1
        ],

        ma30:
        ma30[
            ma30.length-1
        ],

        ma5slope,

        ma15slope,

        ma30slope,

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
