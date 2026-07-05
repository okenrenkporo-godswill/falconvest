import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FalconVest - Advanced Social Copy-Trading & Investment Platform",
  description:
    "Safeguard your trades in stocks, crypto, and forex with FalconVest's secure social copy-trading platform. Mirror institutional-grade strategies, trade smarter with bank-grade encryption, and maximize your returns effortlessly.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent Google Translate/Safari Translate crashes by ignoring NotFoundError on removeChild and insertBefore
              if (typeof Node === 'function' && Node.prototype) {
                var originalRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  try {
                    return originalRemoveChild.call(this, child);
                  } catch (e) {
                    if (e.name === 'NotFoundError' || (e.message && e.message.indexOf('not be found') !== -1)) {
                      return child;
                    }
                    throw e;
                  }
                };

                var originalInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, referenceNode) {
                  try {
                    return originalInsertBefore.call(this, newNode, referenceNode);
                  } catch (e) {
                    if (e.name === 'NotFoundError' || (e.message && e.message.indexOf('not be found') !== -1)) {
                      return newNode;
                    }
                    throw e;
                  }
                };
              }

              window.addEventListener('error', function(event) {
                var isChunkError = event.message && (
                  event.message.includes('ChunkLoadError') || 
                  event.message.includes('Loading chunk')
                );
                var isScriptError = event.target && event.target.tagName === 'SCRIPT' && 
                  event.target.src && event.target.src.includes('/_next/');
                
                if (isChunkError || isScriptError) {
                  var reloadKey = 'next-chunk-reload-attempted';
                  var lastReload = sessionStorage.getItem(reloadKey);
                  var now = Date.now();
                  if (!lastReload || (now - parseInt(lastReload, 10) > 10000)) {
                    sessionStorage.setItem(reloadKey, now.toString());
                    window.location.reload();
                  }
                }
              }, true);

              window.onerror = function(message, source, lineno, colno, error) {
                var errData = {
                  type: 'onerror',
                  message: message,
                  source: source,
                  lineno: lineno,
                  colno: colno,
                  stack: error ? error.stack : null,
                  route: window.location.href,
                  time: new Date().toISOString(),
                  userAgent: navigator.userAgent
                };
                try {
                  localStorage.setItem('last_client_error', JSON.stringify(errData));
                } catch (e) {}
              };

              window.addEventListener('unhandledrejection', function(event) {
                var errData = {
                  type: 'unhandledrejection',
                  reason: event.reason ? (event.reason.message || String(event.reason)) : 'Unknown',
                  stack: event.reason ? event.reason.stack : null,
                  route: window.location.href,
                  time: new Date().toISOString(),
                  userAgent: navigator.userAgent
                };
                try {
                  localStorage.setItem('last_client_error', JSON.stringify(errData));
                } catch (e) {}
              });
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </NextIntlClientProvider>
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '6639c48f734b62ef44bf007bec771b6280b0addf';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `}
        </Script>
        <noscript>
          Powered by{" "}
          <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
            Smartsupp
          </a>
        </noscript>
      </body>
    </html>
  );
}

