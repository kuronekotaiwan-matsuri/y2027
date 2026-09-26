/**
 * 記録と書き手の選択・整形。fs を使わない純粋関数だけを置く。
 * client component からも import できる。
 */
import type { TopicKey } from '@/config/site';
import type { MakingRecord, Person, PersonSummary, RecordSummary } from './types';

type DateSortable = { date: string; slug: string };
type PersonSortable = { id: string; order?: number };
type Authored = { author: string };

export type SortOrder = 'asc' | 'desc';

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 日付昇順、同日は slug 昇順（ファイル名順） */
export function compareRecords(a: DateSortable, b: DateSortable): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return compareText(a.slug, b.slug);
}

export function sortRecordsByDate<T extends DateSortable>(records: T[], order: SortOrder = 'asc'): T[] {
  const sorted = [...records].sort(compareRecords);
  return order === 'asc' ? sorted : sorted.reverse();
}

/** 書き手の並び: order 昇順（order の無い人は後ろ）、同順は id 昇順（仕様書 3.2） */
export function comparePeople(a: PersonSortable, b: PersonSortable): number {
  const ao = a.order ?? Number.POSITIVE_INFINITY;
  const bo = b.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao < bo ? -1 : 1;
  return compareText(a.id, b.id);
}

export function sortPeople<T extends PersonSortable>(people: T[]): T[] {
  return [...people].sort(comparePeople);
}

/** 最新 N 件（新しい順） */
export function latestRecords<T extends DateSortable>(records: T[], count: number): T[] {
  return sortRecordsByDate(records, 'desc').slice(0, count);
}

/** ある書き手の記録（仕様書 5.5。既定は上が古い） */
export function recordsByAuthor<T extends DateSortable & Authored>(
  records: T[],
  authorId: string,
  order: SortOrder = 'asc',
): T[] {
  return sortRecordsByDate(
    records.filter((r) => r.author === authorId),
    order,
  );
}

/** ある topic を持つ記録（仕様書 5.2。準備中ページは新しい順） */
export function recordsByTopic<T extends DateSortable & { topics: TopicKey[] }>(
  records: T[],
  topic: TopicKey,
  order: SortOrder = 'desc',
): T[] {
  return sortRecordsByDate(
    records.filter((r) => r.topics.includes(topic)),
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

/** 全体の時系列での前後の記録（仕様書 5.4） */
export function adjacentRecords<T extends DateSortable>(records: T[], slug: string): Adjacent<T> {
  const sorted = sortRecordsByDate(records, 'asc');
  const index = sorted.findIndex((r) => r.slug === slug);
  if (index < 0) return {};
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}

/** 書き手 ID → 記録数 */
export function countRecordsByAuthor(records: Authored[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.author, (counts.get(record.author) ?? 0) + 1);
  }
  return counts;
}

/** 「〇〇さん」。組織は名前だけ（仕様書 3.8） */
export function nameWithSan(person: Pick<PersonSummary, 'name' | 'kind'>): string {
  return person.kind === 'group' ? person.name : `${person.name}さん`;
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

export function toRecordSummary(record: MakingRecord): RecordSummary {
  const { bodyHtml: _bodyHtml, ...summary } = record;
  return summary;
}

export function toPersonSummary(person: Person): PersonSummary {
  const { bodyHtml: _bodyHtml, ...summary } = person;
  return summary;
}
