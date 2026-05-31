"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  createChart,
} from "lightweight-charts";

function sma(data: any[], period: number) {
  return data.map((item, index) => {
    const range = data.slice(Math.max(0, index - period + 1), index + 1);
    const average =
      range.reduce((sum, candle) => sum + candle.close, 0) / range.length;

    return {
      time: item.time,
      value: average,
    };
  });
}

function calculateRsi(data: any[], period = 14) {
  return data.map((item, index) => {
    if (index < period) return { time: item.time, value: 50 };

    let gains = 0;
    let losses = 0;

    for (let i = index - period + 1; i <= index; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return {
      time: item.time,
      value: rsi,
    };
  });
}
function calculateMacd(data: any[]) {
  const ema12 = sma(data, 12);
  const ema26 = sma(data, 26);

  return data.map((item, index) => ({
    time: item.time,
    value: ema12[index].value - ema26[index].value,
  }));
}
function getProfiScore(data: any[]) {
  if (data.length < 200)
  return {
    score: 50,
    signal: "WAIT",
    ema20: 0,
    ema50: 0,
    ema200: 0,
    rsi: 50,
    macd: 0,
  };

  const ema20 = sma(data, 20);
  const ema50 = sma(data, 50);
  const ema200 = sma(data, 200);
  const rsi = calculateRsi(data);
  const macd = calculateMacd(data);

  const lastClose = data[data.length - 1].close;
  const lastEma20 = ema20[ema20.length - 1].value;
  const lastEma50 = ema50[ema50.length - 1].value;
  const lastEma200 = ema200[ema200.length - 1].value;
  const lastRsi = rsi[rsi.length - 1].value;
  const lastMacd = macd[macd.length - 1].value;

  let score = 50;

  if (lastClose > lastEma20) score += 15;
  else score -= 15;

  if (lastEma20 > lastEma50) score += 15;
  else score -= 15;
  if (lastEma50 > lastEma200) score += 20;
else score -= 20;

  if (lastRsi > 55 && lastRsi < 70) score += 15;
  if (lastRsi > 75) score -= 10;
  if (lastRsi < 35) score -= 15;
  if (lastMacd > 0) score += 15;
else score -= 15;

  const lastCandle = data[data.length - 1];
  if (lastCandle.close > lastCandle.open) score += 5;
  else score -= 5;

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  const signal = score >= 70 ? "BUY" : score <= 35 ? "SELL" : "WAIT";

  return {
  score,
  signal,
  ema20: lastEma20,
  ema50: lastEma50,
  ema200: lastEma200,
  rsi: lastRsi,
  macd: lastMacd,
};
}

export default function CandleChart({
  selectedCoin,
  selectedTimeframe,
  onAnalysisChange,
}: {
  selectedCoin: string;
  selectedTimeframe: string;
  onAnalysisChange?: (analysis: any) => void;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [profiScore, setProfiScore] = useState({
  score: 50,
  signal: "WAIT",
  ema20: 0,
  ema50: 0,
  ema200: 0,
  rsi: 50,
  macd: 0,
});

  useEffect(() => {
    async function loadCandles() {
      try {
        const symbolMap: Record<string, string> = {
          BTC: "BTCUSDT",
          ADA: "ADAUSDT",
          AVAX: "AVAXUSDT",
          GRT: "GRTUSDT",
          KAS: "KASUSDT",
        };

        const intervalMap: Record<string, string> = {
          "1h": "1h",
          "4h": "4h",
          "1d": "1d",
          "1w": "1w",
        };

        const symbol = symbolMap[selectedCoin] ?? "BTCUSDT";
        const interval = intervalMap[selectedTimeframe] ?? "1d";

        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=250`
        );

        const data = await res.json();

        const candles = data.map((item: any[]) => ({
          time: Math.floor(item[0] / 1000),
          open: Number(item[1]),
          high: Number(item[2]),
          low: Number(item[3]),
          close: Number(item[4]),
          volume: Number(item[5]),
        }));

        setChartData(candles);
        setProfiScore(getProfiScore(candles));
      } catch {
        setChartData([]);
        setProfiScore({
  score: 50,
  signal: "WAIT",
  ema20: 0,
  ema50: 0,
  ema200: 0,
  rsi: 50,
  macd: 0,
});
      }
    }

    loadCandles();

    const timer = setInterval(loadCandles, 30000);

    return () => clearInterval(timer);
  }, [selectedCoin, selectedTimeframe]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.offsetWidth,
      height: 520,
      layout: {
        background: { type: ColorType.Solid, color: "#07111f" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#102033" },
        horzLines: { color: "#102033" },
      },
      timeScale: {
        borderColor: "#1e3a5f",
        timeVisible: true,
        barSpacing: 3,
        rightOffset: 4,
      },
      rightPriceScale: {
        borderColor: "#1e3a5f",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData(chartData);

    const ema20Series = chart.addSeries(LineSeries, {
      color: "#facc15",
      lineWidth: 2,
    });

    ema20Series.setData(sma(chartData, 20));

    const ema50Series = chart.addSeries(LineSeries, {
      color: "#38bdf8",
      lineWidth: 2,
    });

    ema50Series.setData(sma(chartData, 50));
    const ema200Series = chart.addSeries(LineSeries, {
  color: "#ff6b6b",
  lineWidth: 2,
});

ema200Series.setData(sma(chartData, 200));

    const volumeData = chartData.map((item) => ({
      time: item.time,
      value: item.volume,
      color:
        item.close >= item.open
          ? "rgba(34,197,94,0.35)"
          : "rgba(239,68,68,0.35)",
    }));

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    setTimeout(() => {
      chart.applyOptions({
        width: chartRef.current?.offsetWidth || 0,
      });
    }, 100);

    return () => {
      chart.remove();
    };
  }, [chartData]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
  style={{
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
    padding: "12px",
    borderRadius: 14,
    background: "rgba(7,17,31,0.92)",
    border: "1px solid rgba(59,130,246,0.28)",
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: 700,
    minWidth: 275,
  }}
>
  <div>Score: {profiScore.score} / 100</div>

<div style={{ marginTop: 6 }}>
  Signal: {profiScore.signal}
</div>

<div style={{ marginTop: 6 }}>
  RSI:{" "}
  {profiScore.rsi < 35
    ? "🟡 fast überverkauft"
    : profiScore.rsi > 70
    ? "🟠 heiß"
    : "🟢 neutral"}
</div>

<div>
  Trend: {profiScore.score >= 60 ? "🟢 positiv" : "🔴 schwach"}
</div>
</div>

      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: 520,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(59,130,246,0.18)",
        }}
      />
    </div>
  );
}