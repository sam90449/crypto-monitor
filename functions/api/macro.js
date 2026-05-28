export async function onRequestGet() {

    try {

        const btcRes =
            await fetch(
                "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
            );

        const ethRes =
            await fetch(
                "https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT"
            );

        const fearRes =
            await fetch(
                "https://api.alternative.me/fng/"
            );

        const btc =
            await btcRes.json();

        const eth =
            await ethRes.json();

        const fear =
            await fearRes.json();

        const btcPrice =
            Number(btc.lastPrice);

        const ethPrice =
            Number(eth.lastPrice);

        const btcChange =
            Number(btc.priceChangePercent);

        const btcVolume =
            (
                Number(btc.quoteVolume) / 1000000000
            ).toFixed(2) + "B";

        const fearValue =
            fear.data[0].value;

        const fearText =
            fear.data[0].value_classification;

        let status = "";
        let icon = "";

        if (btcChange >= 2) {

            status = "強勢看升";
            icon = "🟢";

        } else if (btcChange <= -2) {

            status = "偏弱震盪";
            icon = "🔴";

        } else {

            status = "中性震盪";
            icon = "🟣";
        }

        const data = {

            btc:
                btcPrice.toFixed(2),

            eth:
                ethPrice.toFixed(2),

            btcChange:
                btcChange.toFixed(2) + "%",

            btcVolume,

            totalCap:
                "N/A",

            btcDom:
                "N/A",

            fear:
                fearValue,

            fearText,

            status,

            icon,

            updateTime:
                new Date().toLocaleString(
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
                    "content-type":
                        "application/json"
                }
            }
        );

    } catch (e) {

        return new Response(
            JSON.stringify({
                error:
                    e.toString()
            }),
            {
                headers: {
                    "content-type":
                        "application/json"
                }
            }
        );
    }
}
