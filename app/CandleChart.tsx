"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries, ColorType } from "lightweight-charts";


type CandleChartProps = {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  timeframe?: string;
};

export default function CandleChart({ data, timeframe }: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 520,
      layout: {
        background: { type: ColorType.Solid, color: "#111827" },
        textColor: "#d1d5db",
      },
      grid: {
  vertLines: { color: "#1f2937" },
  horzLines: { color: "#1f2937" },
},

timeScale: {
  timeVisible: true,
  secondsVisible: false,
  borderColor: "#1f2937",
  barSpacing: 14,
  minBarSpacing: 8,
  rightOffset: 6,
},
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
  upColor: "#00ff99",
downColor: "#ff3355",
borderUpColor: "#00ff99",
borderDownColor: "#ff3355",
wickUpColor: "#00ff99",
wickDownColor: "#ff3355",
  priceLineVisible: false,
  lastValueVisible: true,
});

   candleSeries.setData(
  data.map((item) => ({
    time: item.time,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }))
);
const emaData = data.map((item, index) => ({
  time: item.time,
  value:
    data
      .slice(Math.max(0, index - 8), index + 1)
      .reduce((sum, d) => sum + d.close, 0) /
    data.slice(Math.max(0, index - 8), index + 1).length,
}));

const emaSeries = chart.addSeries(LineSeries, {
  color: "#facc15",
  lineWidth: 2,
});

emaSeries.setData(emaData);
  const emaDataLong = data.map((item, index) => ({
  time: item.time,
  value:
    data
      .slice(Math.max(0, index - 20), index + 1)
      .reduce((sum, d) => sum + d.close, 0) /
    data.slice(Math.max(0, index - 20), index + 1).length,
}));

const emaSeriesLong = chart.addSeries(LineSeries, {
  color: "#38bdf8",
  lineWidth: 2,
});

emaSeriesLong.setData(emaDataLong);  
const macdData = emaData.map((item, index) => ({
  time: item.time,
  value: item.value - emaDataLong[index].value,
}));

const macdSeries = chart.addSeries(LineSeries, {
  color: "#a855f7",
  lineWidth: 2,
  priceScaleId: "",
});

macdSeries.setData(macdData);
    

    return () => {
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: "100%", minWidth: 0, height: 520 }} />;
}