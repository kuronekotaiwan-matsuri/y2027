import type { Metadata } from 'next';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/urls';

/** 共通 OGP 画像（public/images/og.png は 1200×630）。layout と各ページで同じ値を使う */
export const defaultOgImage = {
  url: absoluteUrl(site.ogImage),
  width: 1200,
  height: 630,
  alt: site.name,
};

export interface PageMetadataInput {
  /** ページ固有のタイトル。省略するとサイト名だけになる（トップ用） */
  title?: string;
  description?: string;
  /** サイト内パス（/shops/ など） */
  path: string;
  type?: 'website' | 'article';
  /** OGP 画像。/images/... か絶対 URL。省略時は共通画像（寸法付き）。指定時は寸法が分からないので付けない */
  image?: string;
  /**
   * Twitter カードの種類。既定は大画像。
   * 書き手ページは OGP 画像が正方形の顔写真（仕様書 5.5）で、大画像カードでは上下が切れるため summary にする
   */
  card?: 'summary' | 'summary_large_image';
}

/**
 * 各ページの metadata を組み立てる。
 * Next.js は openGraph などの入れ子をページ側で丸ごと置き換えるため、
 * 毎回すべての項目を出す。
 */
export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const description = input.description ?? site.description;
  const fullTitle = input.title ? `${input.title} | ${site.name}` : site.name;
  return {
    ...(input.title ? { title: input.title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? 'website',
      locale: 'ja_JP',
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      images: [input.image ? { url: absoluteUrl(input.image) } : defaultOgImage],
    },
    twitter: {
      card: input.card ?? 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
