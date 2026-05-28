export async function onRequestGet() {

    try {

        // BTC + ETH PRICE
        const priceResponse = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
        );

        const priceData = await priceResponse.json();

        // GLOBAL MARKET DATA
        const globalResponse = await fetch(
            "https://api.coingecko.com/api/v3/global"
        );

        const globalData = await globalResponse.json();

        // FEAR AND GREED
        const fearResponse = await fetch(
            "https://api.alternative.me/fng/?limit=1"
        );

        const fearData = await fearResponse.json();

        // BTC
        const btc =
            priceData?.bitcoin?.usd
                ? Number(priceData.bitcoin.usd).toFixed(2)
                : "N/A";

        // ETH
        const eth =
            priceData?.ethereum?.usd
                ? Number(priceData.ethereum.usd).toFixed(2)
                : "N/A";

        // BTC CHANGE
        const btcChange =
            priceData?.bitcoin?.usd_24h_change
                ? Number(priceData.bitcoin.usd_24h_change).toFixed(2) + "%"
                : "N/A";

        // TOTAL MARKET CAP
        let totalCap = "N/A";

        if (
            globalData &&
            globalData.data &&
            globalData.data.total_market_cap &&
            globalData.data.total_market_cap.usd
        ) {

            const cap = globalData.data.total_market_cap.usd;

            if (cap >= 1000000000000) {

                totalCap =
                    (cap / 1000000000000).toFixed(2) + "T";

            } else if (cap >= 1000000000) {

                totalCap =
                    (cap / 1000000000).toFixed(2) + "B";

            } else {

                totalCap =
                    Number(cap).toFixed(0);

            }

        }

        // BTC DOMINANCE
        const btcDom =
            globalData?.data?.market_cap_percentage?.btc
                ? Number(
                    globalData.data.market_cap_percentage.btc
                ).toFixed(2) + "%"
                : "N/A";

        // BTC VOLUME
        let btcVolume = "N/A";

        if (
            globalData &&
            globalData.data &&
            globalData.data.total_volume &&
            globalData.data.total_volume.usd
        ) {

            const volume =
                globalData.data.total_volume.usd;

            if (volume >= 1000000000000) {

                btcVolume =
                    (volume / 1000000000000).toFixed(2) + "T";

            } else if (volume >= 1000000000) {

                btcVolume =
                    (volume / 1000000000).toFixed(2) + "B";

            } else {

                btcVolume =
                    Number(volume).toFixed(0);

            }

        }

        // FEAR INDEX
        const fear =
            fearData?.data?.[0]?.value || "N/A";

        const fearText =
            fearData?.data?.[0]?.value_classification || "N/A";

        // STATUS
        let status = "中性震盪";
        let icon = "🟣";

        const btcChangeNumber =
            parseFloat(btcChange);

        if (btcChangeNumber >= 3) {

            status = "強勢上升";
            icon = "🟢";

        } else if (btcChangeNumber <= -3) {

            status = "弱勢下跌";
            icon = "🔴";

        }

        // UPDATE TIME
        const updateTime =
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Hong_Kong"
            });

        // FINAL JSON
        return new Response(

            JSON.stringify({

                btc: btc,
                eth: eth,

                btcChange: btcChange,

                btcVolume: btcVolume,

                totalCap: totalCap,

                btcDom: btcDom,

                fear: fear,

                fearText: fearText,

                status: status,

                icon: icon,

                updateTime: updateTime

            }),

            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }

        );

    } catch (error) {

        return new Response(

            JSON.stringify({

                error: error.toString()

            }),

            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        );

    }

}
