'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useTheme } from 'next-themes';

function TradingViewTicker() {
    const container = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!container.current || !mounted) return;

        // Clean up
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": [
                { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
                { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
                { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
                { "description": "Apple", "proName": "NASDAQ:AAPL" },
                { "description": "Tesla", "proName": "NASDAQ:TSLA" }
            ],
            "showSymbolLogo": true,
            "isTransparent": false,
            "displayMode": "adaptive",
            "colorTheme": resolvedTheme === 'dark' ? 'dark' : 'light',
            "locale": "en",
            "largeChartUrl": "#"
        });

        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        container.current.appendChild(widgetDiv);
        container.current.appendChild(script);

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [resolvedTheme, mounted]);

    // If theme is not mounted yet, render placeholder with generic background to minimize layout shift
    if (!mounted) return <div className="py-2 -mx-4 sm:-mx-6 h-[82px] sm:h-[58px]" />;

    return (
        <div className="py-2 -mx-4 sm:-mx-6 relative z-0 overflow-hidden">
            <style jsx global>{`
        /* Hide Branding */
        .tradingview-widget-copyright {
          display: none !important;
        }

        /* 
           Attempt to remove borders on the iframe. 
           Since it's an iframe, we can't style internal elements easily, 
           but we can ensure our container doesn't add any.
           Also set iframe border to 0 explicitly just in case.
        */
        .tradingview-widget-container iframe {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
            <div
                className="tradingview-widget-container w-full h-[82px] sm:h-[58px] border-none"
                ref={container}
            >
            </div>
        </div>
    );
}

export const MarketTicker = memo(TradingViewTicker);
export const MobileBannerBoxes = memo(TradingViewTicker);
