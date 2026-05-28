"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Aggressively hide the Google Translate UI if it manages to bypass CSS
    const observer = new MutationObserver(() => {
      const frames = document.getElementsByTagName('iframe');
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (frame.className.includes('goog-te-banner-frame') || 
            frame.id.includes(':1.container') || 
            frame.id.includes(':0.container')) {
          frame.style.display = 'none';
          frame.style.visibility = 'hidden';
        }
      }
      if (document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: "none" }} aria-hidden="true">
      <div id="google_translate_element"></div>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </div>
  );
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}
