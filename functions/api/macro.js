export async function onRequestGet() {

    let btc = "N/A";
    let eth = "N/A";
    let btcChange = "N/A";
    let btcVolume = "N/A";
    let totalCap = "N/A";
    let btcDom = "N/A";

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

            btc =
                globalJson.data.market_data?.current_price?.usd ||
                globalJson.data.total_market_cap?.usd ||
                "N/A";

            btc = "N/A";

            btcVolume =
                globalJson.data.total_volume?.usd
                    ? (
                        globalJson.data.total_volume.usd / 1000000000
                    ).toFixed(2) + "B"
                    : "N/A";

            totalCap =
