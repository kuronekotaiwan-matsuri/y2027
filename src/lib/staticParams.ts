/**
 * `output: 'export'` では、動的ルートの generateStaticParams が最低1件のパスを返さないと
 * ビルドが失敗する（Next.js 16）。記録や書き手が 0 件のあいだは、ダミーの値を1件返し、
 * ページ側はその値を見つけられないので notFound() を返す（仕様書 9.2）。
 */
export const EMPTY_PLACEHOLDER_SLUG = '_empty';

export interface SlugParam {
  slug: string;
}

export interface IdParam {
  id: string;
}

/** 値の一覧を generateStaticParams の戻り値にする。空ならダミー1件 */
export function paramsOrPlaceholder<K extends string>(key: K, values: string[]): Record<K, string>[] {
  const list = values.length === 0 ? [EMPTY_PLACEHOLDER_SLUG] : values;
  return list.map((value) => ({ [key]: value }) as Record<K, string>);
}

/** 記録ページ用（`[slug]`） */
export function slugParamsOrPlaceholder(slugs: string[]): SlugParam[] {
  return paramsOrPlaceholder('slug', slugs);
}

/** 書き手ページ用（`[id]`） */
export function idParamsOrPlaceholder(ids: string[]): IdParam[] {
  return paramsOrPlaceholder('id', ids);
}
