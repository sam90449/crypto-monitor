export async function onRequestGet() {

    const coins = {};

    let totalCap = "N/A";
    let btcDom = "N/A";
    let btcVolume = "N/A";

    let fear = "N/A";
    let fearText = "N/A";

    let altcoinIndex = "N/A";
    let usdtDom = "N/A";

    let status = "中性震盪";
    let icon = "🟣";

    try {

        // MULTI COINS

        const coinResponse = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,solana,ripple,dogecoin,binancecoin,cardano,avalanche-2,chainlink&vs_currencies=usd&include_24hr_change=true",
            {
                headers: {
                    "accept": "application/json",
                    "user-agent": "Mozilla/5.0"
                }
            }
        );

        const coinJson = await coinResponse.json();

        coins.BTC =
            coinJson?.bitcoin?.usd !== undefined
                ? Number(coinJson.bitcoin.usd).toFixed(2)
                : "N/A";

        coins.ETH =
            coinJson?.ethereum?.usd !== undefined
                ? Number(coinJson.ethereum.usd).toFixed(2)
                : "N/A";

        coins.TON =
            coinJson?.["the-open-network"]?.usd !== undefined
                ? Number(
                    coinJson["the-open-network"].usd
                ).toFixed(2)
                : "N/A";

        coins.SOL =
            coinJson?.solana?.usd !== undefined
                ? Number(coinJson.solana.usd).toFixed(2)
                : "N/A";

        coins.XRP =
            coinJson?.ripple?.usd !== undefined
                ? Number(coinJson.ripple.usd).toFixed(4)
                : "N/A";

        coins.DOGE =
            coinJson?.dogecoin?.usd !== undefined
                ? Number(coinJson.dogecoin.usd).toFixed(4)
                : "N/A";

        coins.BNB =
            coinJson?.binancecoin?.usd !== undefined
                ? Number(coinJson.binancecoin.usd).toFixed(2)
                : "N/A";

        coins.ADA =
            coinJson?.cardano?.usd !== undefined
                ? Number(coinJson.cardano.usd).toFixed(4)
                : "N/A";

        coins.AVAX =
            coinJson?.["avalanche-2"]?.usd !== undefined
                ? Number(
                    coinJson["avalanche-2"].usd
                ).toFixed(2)
                : "N/A";

        coins.LINK =
            coinJson?.chainlink?.usd !== undefined
                ? Number(coinJson.chainlink.usd).toFixed(2)
                : "N/A";

        const btcChangeRaw =
            Number(
                coinJson?.bitcoin?.usd_24h_change || 0
            );

        coins.btcChange =
            btcChangeRaw.toFixed(2) + "%";

        if (btcChangeRaw >= 3) {

            status = "強勢上升";
            icon = "🟢";

        } else if (btcChangeRaw <= -3) {

            status = "弱勢下跌";
            icon = "🔴";

        }

    } catch (e) {

        coins.BTC = "N/A";
        coins.ETH = "N/A";
        coins.TON = "N/A";
        coins.SOL = "N/A";
        coins.XRP = "N/A";
        coins.DOGE = "N/A";
        coins.BNB = "N/A";
        coins.ADA = "N/A";
        coins.AVAX = "N/A";
        coins.LINK = "N/A";

        coins.btcChange = "N/A";

    }

    try {

        // GLOBAL DATA

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
                Number(
                    globalJson.data.total_market_cap.usd
                ) > 0
                    ? (
                        Number(
                            globalJson.data.total_market_cap.usd
                        ) / 1000000000000
                    ).toFixed(2) + "T"
                    : "N/A";

            btcDom =
                globalJson.data.market_cap_percentage?.btc !== undefined
                    ? Number(
                        globalJson.data.market_cap_percentage.btc
                    ).toFixed(2) + "%"
                    : "N/A";

            btcVolume =
                Number(
                    globalJson.data.total_volume.usd
                ) > 0
                    ? (
                        Number(
                            globalJson.data.total_volume.usd
                        ) / 1000000000
                    ).toFixed(2) + "B"
                    : "N/A";

            usdtDom =
                globalJson.data.market_cap_percentage?.usdt !== undefined
                    ? Number(
                        globalJson.data.market_cap_percentage.usdt
                    ).toFixed(2) + "%"
                    : "N/A";

        }

    } catch (e) {

        totalCap = "N/A";
        btcDom = "N/A";
        btcVolume = "N/A";
        usdtDom = "N/A";

    }

    try {

        // FEAR INDEX

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

        fear =
            fearJson?.data?.[0]?.value || "N/A";

        fearText =
            fearJson?.data?.[0]?.value_classification || "N/A";

    } catch (e) {

        fear = "N/A";
        fearText = "N/A";

    }

    try {

        // ALTCOIN INDEX

        altcoinIndex =
            btcDom !== "N/A"
                ? (
                    100 -
                    parseFloat(
                        btcDom.replace("%", "")
                    )
                ).toFixed(2)
                : "N/A";

    } catch (e) {

        altcoinIndex = "N/A";

    }

    const updateTime =
        new Date().toLocaleString(
            "en-US",
            {
                timeZone: "Asia/Hong_Kong"
            }
        );

    return new Response(

        JSON.stringify({

            coins,

            btcChange:
                coins.btcChange,

            btcVolume,

            totalCap,

            btcDom,

            usdtDom,

            fear,

            fearText,

            altcoinIndex,

            status,

            icon,

            updateTime

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
