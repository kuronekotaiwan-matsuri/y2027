/**
 * content/ の読み込み口。ページ（server component）からはここを使う。
 * fs を使うため client component からは import しないこと（select / types を直接 import する）。
 */
import { loadContent } from './load';
import type { ContentData, Story, StoryRecord } from './types';

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

export function getStories(): Story[] {
  return getContent().stories;
}

export function getRecords(): StoryRecord[] {
  return getContent().records;
}

export function getStory(slug: string): Story | undefined {
  return getContent().stories.find((story) => story.slug === slug);
}

export function getRecord(slug: string): StoryRecord | undefined {
  return getContent().records.find((record) => record.slug === slug);
}

/** 最終更新日（最新の記録の日付。記録が無ければ最新の物語の開始日） */
export function getLastUpdated(): string | undefined {
  const { stories, records } = getContent();
  const recordDates = records.map((r) => r.date);
  const storyDates = stories.map((s) => s.startDate);
  const all = [...recordDates, ...storyDates].sort();
  return all[all.length - 1];
}
