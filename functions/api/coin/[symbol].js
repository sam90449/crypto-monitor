export async function onRequest(context) {

    try {

        const symbol =
            context.params.symbol
            .toUpperCase();

        const response =
            await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=30`
            );

        const klines =
            await response.json();

        if (
            !Array.isArray(klines)
        ) {

            return new Response(

                JSON.stringify({
                    error: "BINANCE FAIL"
                }),

                {
                    headers: {
                        "Content-Type":
                        "application/json"
                    }
                }
            );
        }

        const closes =
            klines.map(
                k => parseFloat(k[4])
            );

        function ma(arr, len) {

            const slice =
                arr.slice(-len);

            const sum =
                slice.reduce(
                    (a,b)=>a+b,
                    0
                );

            return sum / len;
        }

        const ma5 =
            ma(closes,5);

        const ma15 =
            ma(closes,15);

        const ma30 =
            ma(closes,30);

        const prev5 =
            ma(
                closes.slice(0,-1),
                5
            );

        const prev15 =
            ma(
                closes.slice(0,-1),
                15
            );

        const prev30 =
            ma(
                closes.slice(0,-1),
                30
            );

        const ma5slope =
            (
                (ma5-prev5)
                /
                prev5
            ) * 100;

        const ma15slope =
            (
                (ma15-prev15)
                /
                prev15
            ) * 100;

        const ma30slope =
            (
                (ma30-prev30)
                /
                prev30
            ) * 100;

        const predict =
            (
                ma5slope * 0.5
                +
                ma15slope * 0.3
                +
                ma30slope * 0.2
            );

        const price =
            closes[
                closes.length - 1
            ];

        const target =
            price *
            (
                1 + predict / 100
            );

        const data = {

            symbol:
                symbol,

            price:
                Number(price),

            target:
                Number(target),

            predict:
                Number(predict),

            ma5:
                Number(ma5),

            ma15:
                Number(ma15),

            ma30:
                Number(ma30),

            ma5slope:
                Number(ma5slope),

            ma15slope:
                Number(ma15slope),

            ma30slope:
                Number(ma30slope),

            updateTime:
                new Date()
                .toLocaleString(
                    "en-US",
                    {
                        timeZone:
                        "Asia/Hong_Kong"
                    }
                )
        };

        return new Response(

            JSON.stringify(data),

            {
                headers: {
                    "Content-Type":
                    "application/json"
                }
            }
        );

    } catch (e) {

        return new Response(

            JSON.stringify({
                error: e.toString()
            }),

            {
                headers: {
                    "Content-Type":
                    "application/json"
                }
            }
        );
    }
}
