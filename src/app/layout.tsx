import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import './globals.css';
import Footer from '@/components/common/Footer/Footer';
import Header from '@/components/common/Header/Header';
import { site } from '@/config/site';
import { getLastUpdated } from '@/lib/content';
import { siteJsonLd } from '@/lib/jsonld';
import { defaultOgImage } from '@/lib/metadata';
import { withBasePath } from '@/lib/urls';

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
    images: [defaultOgImage],
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
        {/* favicon.ico は public/ に置いて手で出す。src/app/favicon.ico の規約は basePath 付きだとトップページで <link> が出ない（Next.js の isFavicon が /favicon.ico 固定のため） */}
        <link rel="icon" href={withBasePath('/favicon.ico')} sizes="16x16 32x32 48x48" type="image/x-icon" />
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
