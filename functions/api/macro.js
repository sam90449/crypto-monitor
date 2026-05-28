export async function onRequestGet() {

    let btc = "N/A";
    let eth = "N/A";
    let btcChange = "N/A";
    let btcVolume = "N/A";
    let totalCap = "N/A";
    let btcDom = "N/A";

    try {

        const btcResponse = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
            {
                headers: {
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0"
                }
            }
        );

        const btcJson = await btcResponse.json();

        btc = btcJson?.bitcoin?.usd
            ? btcJson.bitcoin.usd.toFixed(2)
            : "N/A";

        eth = btcJson?.ethereum?.usd
            ? btcJson.ethereum.usd.toFixed(2)
            : "N/A";

        btcChange = btcJson?.bitcoin?.usd_24h_change
            ? btcJson.bitcoin.usd_24h_change.toFixed(2) + "%"
            : "N/A";

    } catch (e) {

        btc = "N/A";
        eth = "N/A";
        btcChange = "N/A";

    }

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

            btcVolume =
                globalJson.data.total_volume?.usd
                    ? (
                        globalJson.data.total_volume.usd / 1000000000
                    ).toFixed(2) + "B"
                    : "N/A";

            totalCap =
                globalJson.data.total_market_cap?.usd
                    ? (
                        globalJson.data.total_market_cap.usd / 1000000000000
                    ).toFixed(2) + "T"
                    : "N/A";

            btcDom =
                globalJson.data.market_cap_percentage?.btc
                    ? globalJson.data.market_cap_percentage.btc.toFixed(2) + "%"
                    : "N/A";

        }

    } catch (e) {

        btcVolume = "N/A";
        totalCap = "N/A";
        btcDom = "N/A";

    }

    let fear = "N/A";
    let fearText = "N/A";

    try {

        const fearResponse = await fetch(
            "https://api.alternative.me/fng/",
            {
                headers: {
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0"
                }
            }
        );

        const fearJson = await fearResponse.json();

        fear = fearJson?.data?.[0]?.value || "N/A";

        fearText =
            fearJson?.data?.[0]?.value_classification ||
            "N/A";

    } catch (e) {

        fear = "N/A";
        fearText = "N/A";

    }

    const now = new Date();

    const updateTime = now.toLocaleString(
        "en-US",
        {
            timeZone: "Asia/Hong_Kong"
        }
    );

    return new Response(

        JSON.stringify({

            btc,
            eth,
            btcChange,
            btcVolume,
            totalCap,
            btcDom,
            fear,
            fearText,
            status: "中性震盪",
            icon: "🟣",
            updateTime

        }),

        {
            headers: {
                "content-type": "application/json;charset=UTF-8",
                "access-control-allow-origin": "*",
                "cache-control": "no-cache"
            }
        }

    );

}
