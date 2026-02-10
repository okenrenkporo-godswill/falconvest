"use client";

import { useEffect, useRef, memo } from "react";

interface TradingChartProps {
  symbol?: string; // e.g. "BTCUSDT"
}

function TradingChartComponent({ symbol = "BTCUSDT" }: TradingChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const tvSymbol = `BINANCE:${symbol}`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${tvSymbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": "rgba(0, 0, 0, 1)",
        "gridColor": "rgba(66, 66, 66, 0.06)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "calendar": false,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`;

    container.current.innerHTML = "";
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-[calc(100%-32px)] w-full"></div>
    </div>
  );
}

export const TradingChart = memo(TradingChartComponent);
