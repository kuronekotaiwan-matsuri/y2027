import type { Metadata } from 'next';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/urls';

export interface PageMetadataInput {
  /** ページ固有のタイトル。省略するとサイト名だけになる（トップ用） */
  title?: string;
  description?: string;
  /** サイト内パス（/shops/ など） */
  path: string;
  type?: 'website' | 'article';
  /** OGP 画像。/images/... か絶対 URL。省略時は共通画像 */
  image?: string;
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
      images: [{ url: absoluteUrl(input.image ?? site.ogImage) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
