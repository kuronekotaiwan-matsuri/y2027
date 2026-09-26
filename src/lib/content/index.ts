/**
 * content/ の読み込み口。ページ（server component）からはここを使う。
 * fs を使うため client component からは import しないこと（select / types を直接 import する）。
 */
import { site } from '@/config/site';
import { loadContent } from './load';
import type { ContentData, MakingRecord, Person } from './types';

export * from './types';
export * from './select';
export { loadContent, ContentValidationError, type LoadOptions } from './load';
export { markdownToHtml } from './markdown';

let cache: ContentData | undefined;

/** ビルド時に一度だけ読む。開発時は変更を反映するため毎回読み直す */
export function getContent(): ContentData {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  cache = loadContent();
  return cache;
}

export function getPeople(): Person[] {
  return getContent().people;
}

export function getRecords(): MakingRecord[] {
  return getContent().records;
}

export function getPerson(id: string): Person | undefined {
  return getContent().people.find((person) => person.id === id);
}

export function getRecord(slug: string): MakingRecord | undefined {
  return getContent().records.find((record) => record.slug === slug);
}

/**
 * 最終更新日（仕様書 6.2）
 * 最新の記録の日付と、主コンテンツ（準備中ページの状況文）の更新日の新しい方。
 */
export function getLastUpdated(): string | undefined {
  const { records } = getContent();
  const recordDates = records.map((r) => r.date);
  const preparingDates = Object.values(site.preparing).map((status) => status.updated);
  const candidates = [...recordDates, ...preparingDates].filter(Boolean).sort();
  return candidates[candidates.length - 1];
}
