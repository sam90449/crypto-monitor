export async function onRequestGet() {

    const coins = {};

    try {

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,solana,ripple,dogecoin&vs_currencies=usd&include_24hr_change=true",
            {
                headers: {
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0"
                }
            }
        );

        const json = await response.json();

        coins.BTC = json.bitcoin?.usd?.toFixed(2) || "N/A";
        coins.ETH = json.ethereum?.usd?.toFixed(2) || "N/A";
        coins.TON = json["the-open-network"]?.usd?.toFixed(2) || "N/A";
        coins.SOL = json.solana?.usd?.toFixed(2) || "N/A";
        coins.XRP = json.ripple?.usd?.toFixed(2) || "N/A";
        coins.DOGE = json.dogecoin?.usd?.toFixed(4) || "N/A";

        coins.btcChange =
            json.bitcoin?.usd_24h_change
                ? json.bitcoin.usd_24h_change.toFixed(2) + "%"
                : "N/A";

    } catch (e) {

        coins.BTC = "N/A";
        coins.ETH = "N/A";
        coins.TON = "N/A";
        coins.SOL = "N/A";
        coins.XRP = "N/A";
        coins.DOGE = "N/A";

        coins.btcChange = "N/A";

    }

    let totalCap = "N/A";
    let btcDom = "N/A";
    let btcVolume = "N/A";

    try {

        const globalResponse = await fetch(
            "https://api.coingecko.com/api/v3/global",
            {
                headers: {
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0"
                }
            }
        );

        const globalJson = await globalResponse.json();

        if (globalJson && globalJson.data) {

            totalCap =
                (
                    globalJson.data.total_market_cap.usd
                    / 1000000000000
                ).toFixed(2) + "T";

            btcDom =
                globalJson.data.market_cap_percentage.btc
                    .toFixed(2) + "%";

            btcVolume =
                (
                    globalJson.data.total_volume.usd
                    / 1000000000
                ).toFixed(2) + "B";
        }

    } catch (e) {

    }

    let fear = "N/A";
    let fearText = "N/A";

    try {

        const fearResponse = await fetch(
            "https://api.alternative.me/fng/"
        );

        const fearJson = await fearResponse.json();

        fear =
            fearJson?.data?.[0]?.value || "N/A";

        fearText =
            fearJson?.data?.[0]?.value_classification || "N/A";

    } catch (e) {

    }

    return new Response(

        JSON.stringify({

            coins,

            btcChange:
                coins.btcChange,

            btcVolume,

            totalCap,

            btcDom,

            fear,

            fearText,

            status:
                "中性震盪",

            icon:
                "🟣",

            updateTime:
                new Date().toLocaleString(
                    "en-US",
                    {
                        timeZone:
                            "Asia/Hong_Kong"
                    }
                )

        }),

        {
            headers: {
                "content-type":
                    "application/json;charset=UTF-8",
                "access-control-allow-origin":
                    "*",
                "cache-control":
                    "no-cache"
            }
        }

    );

}
