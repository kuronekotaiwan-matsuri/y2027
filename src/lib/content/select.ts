/**
 * 記録と物語の選択・整形。fs を使わない純粋関数だけを置く。
 * client component からも import できる。
 */
import { site, type StoryColor, type TopicKey } from '@/config/site';
import type { RecordSummary, Story, StoryBase, StoryRecord, StorySummary } from './types';

type DateSortable = { date: string; slug: string };
type OrderSortable = { order: number; slug: string };

export type SortOrder = 'asc' | 'desc';

/** 日付昇順、同日は slug 昇順（ファイル名順） */
export function compareRecords(a: DateSortable, b: DateSortable): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

export function sortRecordsByDate<T extends DateSortable>(records: T[], order: SortOrder = 'asc'): T[] {
  const sorted = [...records].sort(compareRecords);
  return order === 'asc' ? sorted : sorted.reverse();
}

export function sortStoriesByOrder<T extends OrderSortable>(stories: T[]): T[] {
  return [...stories].sort((a, b) => a.order - b.order || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

/** 最新 N 件（新しい順） */
export function latestRecords<T extends DateSortable>(records: T[], count: number): T[] {
  return sortRecordsByDate(records, 'desc').slice(0, count);
}

export function recordsByStory<T extends DateSortable & { storySlug: string }>(
  records: T[],
  storySlug: string,
  order: SortOrder = 'asc',
): T[] {
  return sortRecordsByDate(
    records.filter((r) => r.storySlug === storySlug),
    order,
  );
}

export interface RecordsByTopicOptions {
  /** 公式の物語の記録だけにする（仕様書 3.8。準備中ページはこれを使う） */
  officialOnly?: boolean;
  /** officialOnly のときに参照する物語 */
  stories?: Pick<StorySummary, 'slug' | 'kind'>[];
  order?: SortOrder;
}

export function recordsByTopic<T extends DateSortable & { storySlug: string; topics: TopicKey[] }>(
  records: T[],
  topic: TopicKey,
  options: RecordsByTopicOptions = {},
): T[] {
  const { officialOnly = false, stories = [], order = 'desc' } = options;
  const officialSlugs = new Set(stories.filter((s) => s.kind === 'official').map((s) => s.slug));
  return sortRecordsByDate(
    records.filter((r) => {
      if (!r.topics.includes(topic)) return false;
      if (officialOnly && !officialSlugs.has(r.storySlug)) return false;
      return true;
    }),
    order,
  );
}

/** "2026-10-05" → "2026.10" */
export function monthLabel(date: string): string {
  return `${date.slice(0, 4)}.${date.slice(5, 7)}`;
}

export interface MonthGroup<T> {
  /** "2026-10" */
  month: string;
  /** "2026.10" */
  label: string;
  records: T[];
}

/** 入力の並び順を保ったまま月ごとにまとめる */
export function groupByMonth<T extends DateSortable>(records: T[]): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = [];
  for (const record of records) {
    const month = record.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.records.push(record);
    } else {
      groups.push({ month, label: monthLabel(record.date), records: [record] });
    }
  }
  return groups;
}

export interface Adjacent<T> {
  /** ひとつ前（古い方） */
  prev?: T;
  /** ひとつ後（新しい方） */
  next?: T;
}

/** 時系列での前後の記録 */
export function adjacentRecords<T extends DateSortable>(records: T[], slug: string): Adjacent<T> {
  const sorted = sortRecordsByDate(records, 'asc');
  const index = sorted.findIndex((r) => r.slug === slug);
  if (index < 0) return {};
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}

/** 同じ物語の中での前後の記録 */
export function adjacentRecordsInStory<T extends DateSortable & { storySlug: string }>(
  records: T[],
  slug: string,
): Adjacent<T> {
  const target = records.find((r) => r.slug === slug);
  if (!target) return {};
  return adjacentRecords(recordsByStory(records, target.storySlug), slug);
}

export function countRecordsByStory(records: { storySlug: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.storySlug, (counts.get(record.storySlug) ?? 0) + 1);
  }
  return counts;
}

/**
 * 物語の色を割り当てる（docs/design-system.md 2章）。
 * - 公式は palette[0]（赤）で固定
 * - color 指定があればそれを使う（自動割当の枠は消費しない）
 * - それ以外は order 順に palette[1] 以降を割り当てる。足りなければ繰り返す
 */
export function assignStoryColors<T extends Pick<StoryBase, 'slug' | 'kind' | 'order' | 'customColor'>>(
  stories: T[],
  palette: StoryColor[] = site.storyPalette,
): (T & { color: StoryColor })[] {
  const official = palette[0] ?? { bg: '#B7332A', text: '#FFFBF2' };
  const rest = palette.length > 1 ? palette.slice(1) : [official];
  const colors = new Map<string, StoryColor>();
  let next = 0;
  for (const story of sortStoriesByOrder(stories)) {
    if (story.kind === 'official') {
      colors.set(story.slug, official);
    } else if (story.customColor) {
      colors.set(story.slug, { bg: story.customColor, text: official.text });
    } else {
      colors.set(story.slug, rest[next % rest.length]);
      next += 1;
    }
  }
  return stories.map((story) => ({ ...story, color: colors.get(story.slug) ?? official }));
}

/** "2026-10-05" → "2026.10.05" / "10.05" / "2026年10月5日" */
export function formatDate(date: string, style: 'dot' | 'short' | 'ja' = 'dot'): string {
  const [year, month, day] = date.split('-');
  switch (style) {
    case 'short':
      return `${month}.${day}`;
    case 'ja':
      return `${year}年${Number(month)}月${Number(day)}日`;
    default:
      return `${year}.${month}.${day}`;
  }
}

export function toRecordSummary(record: StoryRecord): RecordSummary {
  const { bodyHtml: _bodyHtml, ...summary } = record;
  return summary;
}

export function toStorySummary(story: Story): StorySummary {
  const { bodyHtml: _bodyHtml, ...summary } = story;
  return summary;
}
