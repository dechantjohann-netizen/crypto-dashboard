"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
LineSeries,
HistogramSeries,
  ColorType,
  createChart,
} from "lightweight-charts";

export default function CandleChart({
  selectedCoin,
  selectedTimeframe,
}: {
  selectedCoin: string;
  selectedTimeframe: string;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
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
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=80`
      );

      const data = await res.json();

      const candles = data.map((item: any[]) => ({
        time: Math.floor(item[0] / 1000),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
      }));

      setChartData(candles);
    } catch {
      setChartData([]);
    }
  }

    loadCandles();

  const timer = setInterval(loadCandles, 30000);

  return () => clearInterval(timer);
}, [selectedCoin, selectedTimeframe]);
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 470,
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
  barSpacing: 6,
  rightOffset: 2,
},
      rightPriceScale: {
        borderColor: "#1e3a5f",
      },
    });
chart.applyOptions({
  timeScale: {
    barSpacing: 5,
    rightOffset: 8,
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
const emaData = chartData.map((item, index) => {
  const range = chartData.slice(Math.max(0, index - 19), index + 1);

  const average =
    range.reduce((sum, candle) => sum + candle.close, 0) /
    range.length;

  return {
    time: item.time,
    value: average,
  };
});

const emaSeries = chart.addSeries(LineSeries, {
  color: "#facc15",
  lineWidth: 2,
});

emaSeries.setData(emaData);
const ema50Data = chartData.map((item, index) => {
  const range = chartData.slice(Math.max(0, index - 49), index + 1);

  const average =
    range.reduce((sum, candle) => sum + candle.close, 0) /
    range.length;

  return {
    time: item.time,
    value: average,
  };
});

const ema50Series = chart.addSeries(LineSeries, {
  color: "#38bdf8",
  lineWidth: 2,
});

ema50Series.setData(ema50Data);
const volumeData = chartData.map((item) => ({
  time: item.time,
  value: Math.abs(item.close - item.open) * 100000,
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
const rsiData = chartData.map((item, index) => {
  if (index === 0) {
    return {
      time: item.time,
      value: 50,
    };
  }

  const previous = chartData[index - 1].close;
  const current = item.close;

  const diff = current - previous;

  let value = 50 + diff * 500;

  if (value > 100) value = 100;
  if (value < 0) value = 0;

  return {
    time: item.time,
    value,
  };
});

const rsiSeries = chart.addSeries(LineSeries, {
  color: "#a855f7",
  lineWidth: 2,
  priceScaleId: "",
});

rsiSeries.setData(rsiData);
const lastRsi = rsiData[rsiData.length - 1]?.value ?? 50;

console.log("RSI:", lastRsi);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [selectedCoin, selectedTimeframe]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: 470,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(59,130,246,0.18)",
      }}
    />
  );
}