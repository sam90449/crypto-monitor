export async function onRequest() {

    try {

        async function getJson(url) {

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            return await response.json();
        }

        const btc =
            await getJson(
                "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
            );

        const eth =
            await getJson(
                "https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT"
            );

        const fear =
            await getJson(
                "https://api.alternative.me/fng/?limit=1"
            );

        const global =
            await getJson(
                "https://api.coingecko.com/api/v3/global"
            );

        const btcPrice =
            parseFloat(
                btc.lastPrice || 0
            );

        const ethPrice =
            parseFloat(
                eth.lastPrice || 0
            );

        const btcChange =
            parseFloat(
                btc.priceChangePercent || 0
            );

        const btcVolume =
            parseFloat(
                btc.quoteVolume || 0
            );

        let status = "中性震盪";
        let icon = "⚪";

        if (btcChange >= 2) {

            status = "偏強看漲";
            icon = "🟢";
        }

        if (btcChange <= -2) {

            status = "偏弱震盪";
            icon = "🔴";
        }

        const totalCap =
            global?.data?.total_market_cap?.usd || 0;

        const btcDom =
            global?.data?.market_cap_percentage?.btc || 0;

        const fearValue =
            fear?.data?.[0]?.value || 0;

        const fearText =
            fear?.data?.[0]?.value_classification || "-";

        const data = {

            btc:
                btcPrice,

            eth:
                ethPrice,

            btcChange:
                btcChange.toFixed(2) + "%",

            btcVolume:
                (
                    btcVolume / 1000000000
                ).toFixed(2) + "B",

            totalCap:
                (
                    totalCap / 1000000000000
                ).toFixed(2) + "T",

            btcDom:
                Number(btcDom).toFixed(2) + "%",

            fear:
                fearValue,

            fearText:
                fearText,

            status:
                status,

            icon:
                icon,

            updateTime:
                new Date()
                .toLocaleString("en-US", {
                    timeZone: "Asia/Hong_Kong"
                })
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
