/**
 * `output: 'export'` では、動的ルートの generateStaticParams が最低1件のパスを返さないと
 * ビルドが失敗する（Next.js 16）。記録や物語が 0 件のあいだは、ダミーの slug を1件返し、
 * ページ側はその slug を見つけられないので notFound() を返す。
 */
export const EMPTY_PLACEHOLDER_SLUG = '_empty';

export interface SlugParam {
  slug: string;
}

/** slug の一覧を generateStaticParams の戻り値にする。空ならダミー1件 */
export function slugParamsOrPlaceholder(slugs: string[]): SlugParam[] {
  if (slugs.length === 0) return [{ slug: EMPTY_PLACEHOLDER_SLUG }];
  return slugs.map((slug) => ({ slug }));
}
