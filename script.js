export default {
  async fetch(request) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "content-type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response("", { headers });
    }

    try {

      async function yahoo(symbol) {

        const url =
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;

        const r = await fetch(url, {
          headers: {
            "user-agent":
              "Mozilla/5.0"
          }
        });

        const j = await r.json();

        const result = j.chart.result[0];

        const price = result.meta.regularMarketPrice;

        const prev = result.meta.chartPreviousClose;

        const change = ((price - prev) / prev) * 100;

        return {
          price,
          change
        };
      }

      async function fear() {

        const r = await fetch(
          "https://api.alternative.me/fng/"
        );

        const j = await r.json();

        return {
          value: parseInt(j.data[0].value),
          text: j.data[0].value_classification
        };
      }

      async function btc() {

        const r = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
        );

        const j = await r.json();

        return {
          price: parseFloat(j.lastPrice),
          volume: parseFloat(j.quoteVolume),
          change: parseFloat(j.priceChangePercent)
        };
      }

      const [
        btcData,
        fearData,
        dxy,
        dow,
        vix,
        gold,
        us10y
      ] = await Promise.all([
        btc(),
        fear(),
        yahoo("DX-Y.NYB"),
        yahoo("^DJI"),
        yahoo("^VIX"),
        yahoo("GC=F"),
        yahoo("^TNX")
      ]);

      let score = 0;

      if (dxy.change < 0) score += 1;
      else score -= 1;

      if (dow.change > 0) score += 1;
      else score -= 1;

      if (vix.change < 0) score += 1;
      else score -= 1;

      if (gold.change < 0) score += 1;
      else score -= 1;

      if (us10y.change < 0) score += 1;
      else score -= 1;

      if (fearData.value > 55) score += 1;
      else if (fearData.value < 45) score -= 1;

      let direction = "中性震盪";
      let reason = "市場方向未明";

      if (score >= 5) {
        direction = "強勢看漲";
        reason = "美元轉弱｜風險市場極強";
      }
      else if (score >= 2) {
        direction = "偏強看漲";
        reason = "市場氣氛偏多";
      }
      else if (score <= -5) {
        direction = "強勢看跌";
        reason = "避險情緒極強｜BTC偏弱";
      }
      else if (score <= -2) {
        direction = "偏弱看跌";
        reason = "美元偏強｜BTC偏弱";
      }

      const output = {

        update_time_hk:
          new Date().toLocaleString(
            "zh-HK",
            {
              timeZone: "Asia/Hong_Kong"
            }
          ),

        btc: btcData,

        dxy,

        dow,

        vix,

        gold,

        us10y,

        fear: fearData,

        score,

        direction,

        reason
      };

      return new Response(
        JSON.stringify(output),
        {
          headers
        }
      );

    } catch (e) {

      return new Response(
        JSON.stringify({
          error: e.toString()
        }),
        {
          headers
        }
      );
    }
  }
}
