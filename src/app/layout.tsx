import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import './globals.css';
import Footer from '@/components/common/Footer/Footer';
import Header from '@/components/common/Header/Header';
import { site } from '@/config/site';
import { getLastUpdated } from '@/lib/content';
import { siteJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/urls';

/** Google Fonts（docs/design-system.md 3章） */
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700&family=Klee+One:wght@400;600&display=swap';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    images: [{ url: absoluteUrl(site.ogImage) }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const lastUpdated = getLastUpdated();
  const gaId = site.gaMeasurementId;

  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </head>
      <body>
        <a className="skipLink" href="#main">本文へ移動</a>
        <Header />
        <main id="main">{children}</main>
        <Footer lastUpdated={lastUpdated} />
      </body>
    </html>
  );
}
