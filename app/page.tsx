"use client";

import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CandleChart from "./CandleChart";
const coins = [
  { symbol: "KAS", amount: 82000, buyPrice: 0.059, currentPrice: 0.081 },
  { symbol: "GRT", amount: 12000, buyPrice: 0.13, currentPrice: 0.158 },
  { symbol: "AVAX", amount: 35, buyPrice: 31.4, currentPrice: 34.2 },
  { symbol: "ADA", amount: 4500, buyPrice: 0.48, currentPrice: 0.53 },
  { symbol: "BTC", amount: 0.15, buyPrice: 62000, currentPrice: 68000 },
];

const chartData = [
  { d: "Mo", open: 0.071, high: 0.074, low: 0.069, close: 0.072 },
  { d: "Di", open: 0.072, high: 0.075, low: 0.071, close: 0.074 },
  { d: "Mi", open: 0.074, high: 0.076, low: 0.072, close: 0.073 },
  { d: "Do", open: 0.073, high: 0.078, low: 0.072, close: 0.077 },
  { d: "Fr", open: 0.077, high: 0.082, low: 0.076, close: 0.081 },
  { d: "Sa", open: 0.081, high: 0.083, low: 0.078, close: 0.079 },
  { d: "So", open: 0.079, high: 0.085, low: 0.078, close: 0.083 },
];

function signal(rsi: number, macd: number) {
  if (rsi >= 65 && macd > 0.015) return "STARK BULLISCH";
  if (rsi >= 55 && macd > 0) return "BULLISCH";
  if (rsi <= 35 && macd < -0.015) return "STARK BÄRISCH";
  if (rsi <= 45 && macd < 0) return "BÄRISCH";
  if (rsi > 70) return "ÜBERKAUFT";
  if (rsi < 30) return "ÜBERVERKAUFT";
  return "NEUTRAL";
}
function calculateRSI(prices: number[]) {
  if (prices.length < 3) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < 14; i++) {
    const diff = prices[i] - prices[i - 1];

    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}
function calculateEMA(prices: number[], period: number) {
  const k = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

function calculateMACD(prices: number[]) {
  if (prices.length < 3) return null;

  const ema12 =
    prices.slice(-12).reduce((a, b) => a + b, 0) / 12;

  const ema26 =
    prices.slice(-26).reduce((a, b) => a + b, 0) / 26;

  return Number((ema12 - ema26).toFixed(4));
}
export default function Page() {
  const initialCoins = [
  { 
  id: "kaspa",
  symbol: "KAS",
  icon: "🟢",
  amount: 82000,
  buyPrice: 0.059
},
  { id: "the-graph", symbol: "GRT", amount: 12000, buyPrice: 0.13 },
  { id: "avalanche-2", symbol: "AVAX", amount: 35, buyPrice: 31.4 },
  { id: "cardano", symbol: "ADA", amount: 4500, buyPrice: 0.48 },
  { id: "bitcoin", symbol: "BTC", amount: 0.15, buyPrice: 62000 },
];
  const [mounted, setMounted] = useState(false);
const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    setMounted(true);
  }, []);
const [prices, setPrices] = useState<Record<string, number>>({});
const [selectedCoin, setSelectedCoin] = useState("kaspa");

const [selectedRange, setSelectedRange] = useState("1h");

useEffect(() => {
  async function loadPrices() {
    const ids = initialCoins.map((c) => c.id).join(",");

    let res;

try {
  res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`
  );
} catch {
  return;
}

    const data = await res.json();

    const newPrices: Record<string, number> = {};

    initialCoins.forEach((coin) => {
      newPrices[coin.id] = data[coin.id]?.eur ?? 0;
    });

    setPrices(newPrices);
  }
async function loadChart() {
 const selected =
  initialCoins.find((c) => c.id === selectedCoin)

if (!selected) return;
if (selected.symbol === "KAS") {
  setChartData([
   { d: "2026-05-04", open: 0.071, high: 0.072, low: 0.070, close: 0.0715 },
{ d: "2026-05-05", open: 0.0715, high: 0.073, low: 0.071, close: 0.072 },
{ d: "2026-05-06", open: 0.072, high: 0.073, low: 0.0715, close: 0.0718 },
{ d: "2026-05-07", open: 0.0718, high: 0.074, low: 0.0715, close: 0.073 },
{ d: "2026-05-08", open: 0.073, high: 0.075, low: 0.0725, close: 0.0745 },
{ d: "2026-05-09", open: 0.0745, high: 0.075, low: 0.0735, close: 0.074 },
{ d: "2026-05-10", open: 0.074, high: 0.076, low: 0.0735, close: 0.075 },
  ]);
  return;
}
let res;

try {
  res = await fetch(
   `https://api.binance.com/api/v3/klines?symbol=${selected.symbol}USDT&interval=${selectedRange.toLowerCase()}&limit=1000`
  );
} catch {
  return;
}

  const data = await res.json();

 const formatted = data.map((candle: any) => ({
  d: candle[0] / 1000,
  open: Number(candle[1]),
  high: Number(candle[2]),
  low: Number(candle[3]),
  close: Number(candle[4]),
}));

  setChartData(formatted);
}
  loadPrices();
loadChart();

const timer = setInterval(() => {
  loadPrices();
  loadChart();
}, 60000);

  return () => clearInterval(timer);
}, [selectedCoin, selectedRange]);
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




  const last = chartData.length ? chartData[chartData.length - 1] : null;
const pricesOnly = chartData.map((d: any) => Number(d.close)).filter((p: number) => !Number.isNaN(p));
const rsi = calculateRSI(pricesOnly);
const macd = calculateMACD(pricesOnly);
const signalText = rsi !== null && macd !== null
  ? signal(rsi, macd)
  : "...";
if (!mounted) return null;
  

  return (
<div
  style={{
    display: "flex",
    background:"050505",
    color: "white",
    minHeight: "100vh",
  }}
  >
  <div
  style={{
    width: 220,
    background: "0b0b0f",
borderRight: "1px solid#1f1f1f",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  }}
>
  <div
    style={{
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 20,
      color: "#3b82f6",
    }}
  >
    Ivan
  </div>

  {[
  { name: "Dashboard", icon: "▦" },
  { name: "Portfolio", icon: "◫" },
  { name: "Markets", icon: "▥" },
  { name: "Signals", icon: "◉" },
  { name: "Settings", icon: "⚙" },
].map((item) => (
  <div
    key={item.name}
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      background:
        item.name === "Dashboard"
          ? "#111827"
          : "transparent",
      border:
        item.name === "Dashboard"
          ? "1px solid #2563eb"
          : "1px solid transparent",
      cursor: "pointer",
      
      boxShadow:
        item.name === "Dashboard"
          ? "0 0 20px rgba(37,99,235,0.35)"
          : "none",
      transition: "0.2s",
      transform:
        item.name === "Dashboard"
          ? "translateX(4px)"
          : "translateX(0px)",
      fontWeight: 600,
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.background = "#111827";
  e.currentTarget.style.transform = "translateX(6px)";
}}

onMouseLeave={(e) => {
  if (item.name !== "Dashboard") {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "translateX(0px)";
  }
}}
  >
    <>
      <span style={{ marginRight: 10 }}>{item.icon}</span>
      {item.name}
    </>
  </div>
))}
</div>
<div
  style={{
    flex: 1,
    padding: 24,
  }}
>
    <div
  style={{
    display: "flex",
    gap: 20,
    marginBottom: 20,
    flexWrap: "wrap",
  }}
>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    padding: "16px 20px",
    background: "#0b0b0f",
    border: "1px solid #1f1f1f",
    borderRadius: 18,
  }}
>
  <div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
      }}
    >
      Crypto Dashboard
    </div>

    <div
      style={{
        color: "#888",
        marginTop: 4,
        fontSize: 14,
      }}
    >
      Live Market Overview
    </div>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#22c55e",
        boxShadow: "0 0 12px #22c55e",
      }}
    />

    <div
      style={{
        fontWeight: 600,
      }}
    >
      LIVE
    </div>
  </div>
</div>
<div
  style={{
    display: "flex",
    gap: 20,
    marginBottom: 20,
    flexWrap: "wrap",
  }}
  >
    <div style={{ color: "#888", fontSize: 14 }}>
      Portfolio Wert
    </div>
</div>
   <div
  style={{
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  }}
>
   {totals.current.toFixed(2)} €
</div> 
 
  <div
    style={{
      background: "#111",
      padding: 20,
      borderRadius: 12,
      minWidth: 220,
      border: "1px solid #333",
      boxShadow: "0 0 25px rgba(59,130,246,0.22)",
    }}
  >
    <div style={{ color: "#888", fontSize: 14 }}>
      Gewinn / Verlust
    </div>

    <div
      style={{
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 10,
        color: totals.profit >= 0 ? "lime" : "red",
      }}
    >
      {totals.profit.toFixed(2)} €
    </div>

    <div
      style={{
        marginTop: 8,
        color: totals.profit >= 0 ? "lime" : "red",
      }}
    >
      {totals.pct.toFixed(2)} %
    </div>
  </div>
</div> 

<h2>Coins</h2>
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20
}}>
{coins.map((coin) => {
  const value = coin.amount * coin.currentPrice;
  const invested = coin.amount * coin.buyPrice;
  const profit = value - invested;
  const profitPct = invested ? (profit / invested) * 100 : 0;

  return (
    <div
     key={coin.id}
      onClick={() => setSelectedCoin(coin.id)}
      onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-6px)";
}}

onMouseLeave={(e) => {
  if (selectedCoin !== coin.id) {
    e.currentTarget.style.transform = "translateY(0px)";
  }
}}
      style={{
  cursor: "pointer",
  willChange: "transform",
  background:
    selectedCoin === coin.id
      ? "linear-gradient(135deg, #1f2937, #111827)"
      : "#111",
  marginBottom: 20,
  padding: 20,
  backdropFilter: "blur(18px)",
  overflow: "hidden",
position: "relative",
  borderRadius: 18,
  border:
    selectedCoin === coin.id
      ? "1px solid #3b82f6"
      : "1px solid #333",
  boxShadow:
  selectedCoin === coin.id
    ? "0 0 30px rgba(59,130,246,0.45)"
    : "0 4px 20px rgba(0,0,0,0.35)",
  transition: "all 0.2s ease",
  transform:
  selectedCoin === coin.id
    ? "translateY(-4px)"
    : "translateY(0px)",
 
 }}
>
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    fontSize: 22,
fontWeight: 800,
letterSpacing: 0.5,
  }}
  
onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-6px) scale(1.02)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    selectedCoin === coin.id
      ? "translateY(-4px) scale(1.03)"
      : "scale(1)";
}}
>
  
  <div
style={{
  width: 18,
  height: 18,
  borderRadius: "50%",
  background:
    coin.symbol === "KAS"
      ? "#4ade80"
      : coin.symbol === "GRT"
      ? "#3b82f6"
      : coin.symbol === "AVAX"
      ? "#ef4444"
      : coin.symbol === "ADA"
      ? "#60a5fa"
      : "#f59e0b",
  boxShadow:
  coin.symbol === "KAS"
    ? "0 0 25px #00ff99"
    : coin.symbol === "GRT"
    ? "0 0 25px #3b82f6"
    : coin.symbol === "AVAX"
    ? "0 0 25px #ff3355"
    : coin.symbol === "ADA"
    ? "0 0 25px #60a5fa"
    : "0 0 25px #ffb300",
}}
/>
  <span>{coin.symbol}</span>
</div>
      Menge: {coin.amount}<br />
      Preis: {coin.currentPrice.toFixed(4)} €<br />
      Wert: {value.toFixed(2)} €<br /><br />
      Gewinn:{" "}
<span
  style={{
    color: profit >= 0 ? "#22c55e" : "#ef4444",
    fontWeight: 700,
    fontSize: 15,
    textShadow:
      profit >= 0
        ? "0 0 10px rgba(34,197,94,0.45)"
        : "0 0 10px rgba(239,68,68,0.45)",
  }}
>
  {profit >= 0 ? "▲ " : "▼ "}
        {profit.toFixed(2)} € ({profitPct.toFixed(2)} %)
      </span>
    </div>
  );
})}
</div>

<div style={{
  display: "grid",
   gridTemplateColumns: "1fr",
  alignItems: "start",
  gap: 20,
  marginTop: 30,
  padding: 20,
  borderRadius: 20,
backdropFilter: "blur(14px)",
  background: "black",
  border: "1px solid gray",
  boxShadow: "0 0 35px rgba(59,130,246,0.12)",
}}>
  <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15
}}>
  <h2 style={{ margin: 0 }}>Chart</h2>
  <div style={{
    fontSize: 14,
    opacity: 0.8
  }}>
    Preis: {last ? last.close.toFixed(4) : "..."} €
  </div>
</div>

<div style={{
  display: "flex",
  gap: 10,
  marginBottom: 15
}}>
  {["1m", "5m", "15m", "1h", "4h", "1d", "1w"].map((timeframe) => (
  <button
    key={timeframe}
    onClick={() => setSelectedRange(timeframe)}
    style={{
      padding: "12px 22px",
borderRadius: 16,
      border: "1px solid #333",
      transition: "all 0.2s ease",
boxShadow:
  selectedRange === timeframe
    ? "0 0 18px rgba(37,99,235,0.45)"
    : "none",
transform:
  selectedRange === timeframe
    ? "translateY(-2px)"
    : "translateY(0px)",
     
    
      background: selectedRange === timeframe ? "#2563eb" : "#111",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    {timeframe}
  </button>
))}
</div>

  <div
style={{
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) 260px",
  gap: 20,
  alignItems: "start",
}}
>
  <div>
  
 <CandleChart
  data={chartData.map((item) => ({
    time: item.d,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }))}
  timeframe={selectedRange}
/>

{/* RSI */}
<div
  style={{
    background: "#0f1117",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <div style={{ fontWeight: "bold" }}>RSI (14)</div>
    <div style={{ color: "#facc15" }}>48.23</div>
  </div>

  <div
    style={{
      height: 110,
      borderRadius: 12,
      background: "#111827",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#666",
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 500 100">
  <polyline
    fill="none"
    stroke="#facc15"
    strokeWidth="3"
    points="
      0,70
      40,60
      80,45
      120,50
      160,35
      200,40
      240,55
      280,48
      320,60
      360,52
      400,42
      440,50
      500,48
    "
  />
</svg>
  </div>
</div>

{/* MACD */}
<div
  style={{
    background: "#0f1117",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <div style={{ fontWeight: "bold" }}>MACD</div>
    <div style={{ color: "#22c55e" }}>Bullish</div>
  </div>

  <div
    style={{
      height: 130,
      borderRadius: 12,
      background: "#111827",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#666",
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 500 120">
  <polyline
    fill="none"
    stroke="#22c55e"
    strokeWidth="3"
    points="
      0,80
      40,70
      80,75
      120,50
      160,40
      200,60
      240,45
      280,30
      320,40
      360,35
      400,50
      440,45
      500,55
    "
  />

  <polyline
    fill="none"
    stroke="#3b82f6"
    strokeWidth="2"
    points="
      0,90
      40,85
      80,80
      120,70
      160,60
      200,58
      240,52
      280,48
      320,50
      360,46
      400,48
      440,50
      500,52
    "
  />
</svg>
  </div>
</div>
<div
  style={{
    background: "#0f1117",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
    height: "fit-content",
  }}
>
  <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
    Markt Infos
  </div>

  <div style={{ marginBottom: 14 }}>
    <div style={{ color: "#888", fontSize: 13 }}>Coin</div>
    <div style={{ fontSize: 22, fontWeight: "bold" }}>
      {selectedCoin.toUpperCase()}
    </div>
  </div>

  <div style={{ marginBottom: 14 }}>
    <div style={{ color: "#888", fontSize: 13 }}>Signal</div>
    <div
      style={{
        color: signalText.includes("BULLISCH")
          ? "#22c55e"
          : signalText.includes("BÄRISCH")
          ? "#ef4444"
          : "white",
        fontWeight: "bold",
      }}
    >
      {signalText}
    </div>
  </div>

  <div style={{ marginBottom: 14 }}>
    <div style={{ color: "#888", fontSize: 13 }}>Zeitraum</div>
    <div>{selectedRange}</div>
  </div>

  <div>
    <div style={{ color: "#888", fontSize: 13 }}>Live Preis</div>
    <div style={{ fontSize: 20, fontWeight: "bold" }}>
      € {last ? last.close.toFixed(4) : "..."}
    </div>
  </div>
</div>
</div>
</div>

      <h2>Signal</h2>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: 260,
  }}
>
  <div
    style={{
      padding: 16,
      borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ color: "#888", fontSize: 13 }}>
      RSI
    </div>

    <div
      style={{
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 6,
        color:
        (rsi ?? 0) > 70
  ? "#ff5555"
  : (rsi ?? 0) < 30
  ? "#00ff99"
  : "white",  
      }}
    >
      {rsi !== null ? rsi.toFixed(2) : "---"}
    </div>
  </div>

  <div
    style={{
      padding: 16,
      borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ color: "#888", fontSize: 13 }}>
      MACD
    </div>

    <div
      style={{
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 6,
        color: (macd ?? 0) >= 0 ? "#00ff99" : "#ff5555",
      }}
    >
      {macd !== null ? macd.toFixed(4) : "---"}
    </div>
  </div>

  <div
    style={{
      padding: 18,
      borderRadius: 18,
      background:
        signalText.includes("BULLISCH")
          ? "rgba(0,255,120,0.12)"
          : signalText.includes("BÄRISCH")
          ? "rgba(255,0,0,0.12)"
          : "rgba(255,255,255,0.05)",

      border:
        signalText.includes("BULLISCH")
          ? "1px solid lime"
          : signalText.includes("BÄRISCH")
          ? "1px solid red"
          : "1px solid #444",
    }}
  >
    <div
      style={{
        color: "#888",
        fontSize: 13,
        marginBottom: 8,
      }}
    >
      SIGNAL STATUS
    </div>

    <div
      style={{
        fontSize: 22,
        fontWeight: "bold",
        color:
          signalText.includes("BULLISCH")
            ? "#00ff99"
            : signalText.includes("BÄRISCH")
            ? "#ff5555"
            : "white",
      }}
    >
      {signalText}
    </div>
  </div>
</div>
</div>

</div>
</div>

);
}