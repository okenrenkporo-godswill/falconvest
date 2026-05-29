import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";

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
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            window._smartsupp = window._smartsupp || {};
            window._smartsupp.key = '58024e205dccbafcff726e8499b5bcb1f41c87d7';
            window._smartsupp.color = '#33525c';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `}
        </Script>
      </body>
    </html>
  );
}

