"use client";

import { useEffect, useMemo, useState } from "react";
import CandleChart from "./CandleChart";

type Coin = {
  id: string;
  symbol: string;
  amount: number;
  buyPrice: number;
};

const initialCoins: Coin[] = [
  { id: "kaspa", symbol: "KAS", amount: 82000, buyPrice: 0.059 },
  { id: "the-graph", symbol: "GRT", amount: 12000, buyPrice: 0.13 },
  { id: "avalanche-2", symbol: "AVAX", amount: 35, buyPrice: 31.4 },
  { id: "cardano", symbol: "ADA", amount: 4500, buyPrice: 0.48 },
  { id: "bitcoin", symbol: "BTC", amount: 0.15, buyPrice: 62000 },
];

export default function Page() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState("KAS");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d");
  const [marketAnalysis, setMarketAnalysis] = useState<any>({
  score: 50,
  signal: "WAIT",
  ema20: 0,
  ema50: 0,
  ema200: 0,
  rsi: 50,
  macd: 0,
});
const [showForecast, setShowForecast] = useState(false);
const [showReasons, setShowReasons] = useState(false);

const forecastScore = Math.max(
  0,
  Math.min(100, marketAnalysis.score)
);
const shortProbability = Math.max(
  0,
  Math.min(
    100,
    marketAnalysis.score +
      (marketAnalysis.rsi < 35 ? 8 : 0) +
      (marketAnalysis.macd > 0 ? 7 : -7)
  )
);

const midProbability = Math.max(
  0,
  Math.min(
    100,
    50 +
      (marketAnalysis.ema20 > marketAnalysis.ema50 ? 15 : -10) +
      (marketAnalysis.macd > 0 ? 10 : -10)
  )
);

const longProbability = Math.max(
  0,
  Math.min(
    100,
    50 +
      (marketAnalysis.ema50 > marketAnalysis.ema200 ? 20 : -15) +
      (marketAnalysis.ema20 > marketAnalysis.ema200 ? 10 : -10)
  )
);

const shortForecast =
  shortProbability >= 65
    ? `↗ Bullisch (${shortProbability.toFixed(0)}%)`
    : shortProbability >= 40
    ? `→ Neutral (${shortProbability.toFixed(0)}%)`
    : `↘ Bärisch (${shortProbability.toFixed(0)}%)`;

const midForecast =
  midProbability >= 65
    ? `↗ Bullisch (${midProbability.toFixed(0)}%)`
    : midProbability >= 40
    ? `→ Neutral (${midProbability.toFixed(0)}%)`
    : `↘ Bärisch (${midProbability.toFixed(0)}%)`;

const longForecast =
  longProbability >= 65
    ? `↗ Bullisch (${longProbability.toFixed(0)}%)`
    : longProbability >= 40
    ? `→ Neutral (${longProbability.toFixed(0)}%)`
    : `↘ Bärisch (${longProbability.toFixed(0)}%)`;

  useEffect(() => {
    async function loadPrices() {
      try {
        const ids = initialCoins.map((c) => c.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`
        );
        const data = await res.json();

        const nextPrices: Record<string, number> = {};
        initialCoins.forEach((coin) => {
          nextPrices[coin.id] = data[coin.id]?.eur ?? 0;
        });

        setPrices(nextPrices);
      } catch {
        return;
      }
    }

    loadPrices();
    const timer = setInterval(loadPrices, 60000);
    return () => clearInterval(timer);
  }, []);

  const coins = initialCoins.map((coin) => ({
    ...coin,
    currentPrice: prices[coin.id] ?? 0,
  }));

  const totals = useMemo(() => {
    const invested = coins.reduce((s, c) => s + c.amount * c.buyPrice, 0);
    const current = coins.reduce((s, c) => s + c.amount * c.currentPrice, 0);

    return {
      invested,
      current,
      profit: current - invested,
      pct: invested ? ((current - invested) / invested) * 100 : 0,
    };
  }, [coins]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
  "radial-gradient(circle at top left, #0f172a 0%, #050816 45%, #020617 100%)",
        color: "white",
                display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: 12,
        fontFamily: "Arial, sans-serif",
        width: "100%",
maxWidth: 430,
        margin: "0 auto",
        overflowX: "hidden",
      }}
    >
      

      <section
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 22,
    width: "100%",
  }}
>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 14,
  }}
>
  <div
    style={{
      fontSize: 30,
      cursor: "pointer",
    }}
  >
    ☰
  </div>

  <div>
    <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>
      Crypto Dashboard
    </h1>

    <div
      style={{
        color: "#9ca3af",
        marginTop: 6,
      }}
    >
      Live Market Overview
    </div>
  </div>
</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>Portfolio Wert</div>
            <div style={bigStyle}>{totals.current.toFixed(2)} €</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Gewinn / Verlust</div>
            <div
              style={{
                ...bigStyle,
                color: totals.profit >= 0 ? "#22c55e" : "#ef4444",
              }}
            >
              {totals.profit.toFixed(2)} €
            </div>
            <div
              style={{
                color: totals.profit >= 0 ? "#22c55e" : "#ef4444",
                marginTop: 8,
              }}
            >
              {totals.pct.toFixed(2)} %
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {coins.map((coin) => {
            const value = coin.amount * coin.currentPrice;
            const invested = coin.amount * coin.buyPrice;
            const profit = value - invested;

            return (
              <div
  key={coin.id}
  onClick={() => setSelectedCoin(coin.symbol)}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedCoin === coin.symbol
        ? "1px solid rgba(59,130,246,0.9)"
        : cardStyle.border,
    boxShadow:
      selectedCoin === coin.symbol
        ? "0 0 28px rgba(59,130,246,0.22)"
        : cardStyle.boxShadow,
  }}
>
                <div style={{ fontSize: 20, fontWeight: 900 }}>
                  {coin.symbol}
                </div>
                <div style={labelStyle}>Wert</div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>
                  {value.toFixed(2)} €
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: profit >= 0 ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {profit.toFixed(2)} €
                </div>
              </div>
            );
          })}
        </div>

        <div style={chartStyle}>
          <div
            style={{
              display: "flex",
flexDirection: "column",
gap: 14,
marginBottom: 18,
            }}
          >
            <div>
  <h2 style={{ margin: 0 }}>
    {selectedCoin} / USDT
  </h2>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
    }}
  >
    <div
  style={{
    color:
      (
        coins.find((c) => c.symbol === selectedCoin)?.currentPrice ?? 0
      ) >=
      (
        coins.find((c) => c.symbol === selectedCoin)?.buyPrice ?? 0
      )
        ? "#22c55e"
        : "#ef4444",
    fontWeight: 800,
    fontSize: 15,
  }}
>
  {coins.find((c) => c.symbol === selectedCoin)?.currentPrice.toFixed(4)} €
</div>

    <div
      style={{
        color: "#9ca3af",
        fontSize: 22,
      }}
    >
      ● LIVE · Binance · {selectedTimeframe}
    </div>
  </div>
</div>
            <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    width: "100%",
  }}
>
  {["1h", "4h", "1d", "1w"].map((tf) => (
    <button
      key={tf}
      onClick={() => setSelectedTimeframe(tf)}
      style={{
        background: selectedTimeframe === tf ? "#2563eb" : "transparent",
        color: "white",
        border: "1px solid rgba(59,130,246,0.35)",
        borderRadius: 12,
        padding: "12px 0",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 16,
      }}
    >
      {tf}
    </button>
  ))}
</div>
          </div>
<CandleChart
  selectedCoin={selectedCoin}
  selectedTimeframe={selectedTimeframe}
  onAnalysisChange={setMarketAnalysis}
/>
        </div>
      </section>

      <aside style={infoBoxStyle}>
  <h2
  style={{
    margin: 0,
    fontSize: 38,
    fontWeight: 900,
    letterSpacing: -1,
  }}
>
    Market Infos
  </h2>

  <div>
    <div style={labelStyle}>Coin</div>

    <div
      style={{
        fontSize: 58,
        fontWeight: 900,
      }}
    >
      {selectedCoin}
    </div>
  </div>

  <div>
  <div style={labelStyle}>Signal</div>

  <div
  style={{
    color:
      selectedCoin === "BTC"
        ? "#22c55e"
        : "#f59e0b",
    fontSize: 28,
    fontWeight: 900,
  }}
>
  LIVE ANALYSE
</div>
<div
  style={{
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    lineHeight: 1.8,
    fontSize: 15,
  }}
>
  <div>
  📈 Marktstatus:{" "}
  {marketAnalysis.score >= 70
    ? "Stark bullisch"
    : marketAnalysis.score >= 40
    ? "Neutral"
    : "Bärisch"}
</div>

<div>
  📊 Trend:{" "}
  {marketAnalysis.ema20 > marketAnalysis.ema50 &&
  marketAnalysis.ema50 > marketAnalysis.ema200
    ? "Aufwärtstrend"
    : "Schwacher Trend"}
</div>

<div>
  ⚡ Momentum:{" "}
  {marketAnalysis.rsi < 35
    ? `Fast überverkauft (${marketAnalysis.rsi.toFixed(0)})`
    : marketAnalysis.rsi > 70
    ? `Überhitzt (${marketAnalysis.rsi.toFixed(0)})`
    : `Neutral (${marketAnalysis.rsi.toFixed(0)})`}
</div>

<div>
  🎯 Signal: {marketAnalysis.signal}
</div>
</div>

  <div
  style={{
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    lineHeight: 1.8,
    fontSize: 15,
  }}
>
  <div>
    {marketAnalysis.ema20 > marketAnalysis.ema50
      ? "🟢 Kurzfristiger Trend"
      : "🔴 Kurzfristiger Trend"}
  </div>

  <div>
    {marketAnalysis.ema50 > marketAnalysis.ema200
      ? "🟢 Mittelfristiger Trend"
      : "🔴 Mittelfristiger Trend"}
  </div>

  <div>
    {marketAnalysis.ema20 > marketAnalysis.ema200
      ? "🟢 Langfristiger Trend"
      : "🔴 Langfristiger Trend"}
  </div>
</div>
</div>

  <div>
    <button
  onClick={() => setShowForecast(!showForecast)}
  style={{
    marginTop: 18,
    width: "100%",
    padding: "14px",
    borderRadius: 14,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "#2563eb",
    color: "white",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  }}
>
  🔮 Prognose anzeigen
</button>

{showForecast && (
  <div
    style={{
      marginTop: 14,
      padding: 14,
      borderRadius: 14,
      background: "rgba(255,255,255,0.03)",
      lineHeight: 1.8,
      fontSize: 15,
    }}
  >
    <div
  style={{
    color: shortProbability >= 65 ? "#22c55e" : shortProbability < 40 ? "#ef4444" : "#facc15",
    fontWeight: 700,
  }}
>
  📅 7 Tage: {shortForecast}
</div>

<div
  style={{
    color: midProbability >= 65 ? "#22c55e" : midProbability < 40 ? "#ef4444" : "#facc15",
    fontWeight: 700,
  }}
>
  📅 30 Tage: {midForecast}
</div>

<div
  style={{
    color: longProbability >= 65 ? "#22c55e" : longProbability < 40 ? "#ef4444" : "#facc15",
    fontWeight: 700,
  }}
>
  📅 90 Tage: {longForecast}
</div>
    
    <button
  onClick={() => setShowReasons(!showReasons)}
  style={{
    marginTop: 12,
    width: "100%",
    padding: "10px",
    borderRadius: 10,
    border: "none",
    background: "#1e293b",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  }}
>
  🔍 Warum diese Prognose?
</button>
{showReasons && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      fontSize: 14,
      lineHeight: 1.8,
    }}
  >
    <div>
      {marketAnalysis.ema20 > marketAnalysis.ema50
        ? "✅ EMA20 über EMA50"
        : "❌ EMA20 unter EMA50"}
    </div>

    <div>
      {marketAnalysis.ema50 > marketAnalysis.ema200
        ? "✅ EMA50 über EMA200"
        : "❌ EMA50 unter EMA200"}
    </div>

    <div>
      {marketAnalysis.rsi < 35
        ? "✅ RSI günstig"
        : marketAnalysis.rsi > 70
        ? "⚠️ RSI überkauft"
        : "➖ RSI neutral"}
    </div>

    <div>
      {marketAnalysis.macd > 0
        ? "✅ MACD positiv"
        : "❌ MACD negativ"}
    </div>
  </div>
)}
  </div>
)}
    <div style={labelStyle}>Zeitraum</div>

    <div
      style={{
        fontSize: 36,
        fontWeight: 800,
      }}
    >
      {selectedTimeframe}
    </div>
  </div>

  <div>
    <div style={labelStyle}>Live Preis</div>

    <div
      style={{
        fontSize: 48,
        fontWeight: 900,
      }}
    >
      {
        coins
          .find((c) => c.symbol === selectedCoin)
          ?.currentPrice.toFixed(4)
      }
      €
    </div>
  </div>

  <div
    style={{
      borderTop: "1px solid rgba(255,255,255,0.08)",
      paddingTop: 34,
      marginTop: 20,
    }}
  >
    <div
      style={{
        marginBottom: 28,
      }}
    >
      <div style={labelStyle}>RSI</div>

      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: "#1f2937",
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, marketAnalysis.rsi))}%`,
            height: "100%",
            background:
  marketAnalysis.rsi > 70
    ? "#ef4444"
    : marketAnalysis.rsi < 30
    ? "#f59e0b"
    : "#22c55e",
          }}
        />
      </div>
    </div>

    <div
      style={{
        marginBottom: 28,
      }}
    >
      <div style={labelStyle}>MACD</div>

      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: "#1f2937",
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${Math.min(
  100,
  Math.max(0, 50 + marketAnalysis.macd / 50)
)}%`,
            height: "100%",
            background:
  marketAnalysis.macd > 0
    ? "#22c55e"
    : "#ef4444",
          }}
        />
      </div>
    </div>

    <div>
      <div style={labelStyle}>Volumen</div>

      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: "#1f2937",
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${Math.max(
  20,
  Math.min(100, Math.abs(marketAnalysis.macd))
)}%`,
            height: "100%",
            background:
  marketAnalysis.macd > 0
    ? "#22c55e"
    : "#f59e0b",
          }}
        />
      </div>
    </div>
  </div>
</aside>
    </main>
  );
}

function Info({
  label,
  value,
  green,
  blue,
}: {
  label: string;
  value: string;
  green?: boolean;
  blue?: boolean;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: green ? "#22c55e" : blue ? "#3b82f6" : "white",
        }}
      >
        {value}
      </div>
    </div>
  );
}
const infoBoxStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(5,10,20,0.98), rgba(3,8,18,0.98))",
  border: "1px solid rgba(59,130,246,0.32)",
  borderRadius: 34,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "auto",
  width: "100%",
  boxShadow:
  "0 0 60px rgba(59,130,246,0.14), inset 0 0 30px rgba(255,255,255,0.02)",
};
const panelStyle: React.CSSProperties = {
  background: "rgba(10,15,30,0.92)",
  border: "1px solid rgba(59,130,246,0.18)",
  borderRadius: 34,
  padding: 22,
  boxShadow:
  "0 0 24px rgba(59,130,246,0.10)",
  display: "flex",
  flexDirection: "column",
  gap: 26,
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,12,24,0.98))",
  border: "1px solid rgba(59,130,246,0.18)",
  borderRadius: 18,
  padding: 18,
  boxShadow:
  "0 0 30px rgba(59,130,246,0.12), inset 0 0 18px rgba(255,255,255,0.02)",
};

const chartStyle: React.CSSProperties = {
  background: "rgba(10,15,30,0.92)",
  border: "1px solid rgba(59,130,246,0.18)",
  borderRadius: 20,
  padding: 18,
  boxShadow:
  "0 0 24px rgba(59,130,246,0.10)"
};

const labelStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 18,
  marginBottom: 10,
};

const bigStyle: React.CSSProperties = {
  letterSpacing: -1,
  fontSize: 32,
  fontWeight: 900,
};