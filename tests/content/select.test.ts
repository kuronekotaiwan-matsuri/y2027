import { describe, expect, it } from 'vitest';
import type { TopicKey } from '@/config/site';
import {
  adjacentRecords,
  countRecordsByAuthor,
  formatDate,
  groupByMonth,
  latestRecords,
  monthLabel,
  nameWithSan,
  recordsByAuthor,
  recordsByTopic,
  sortPeople,
  sortRecordsByDate,
} from '@/lib/content/select';

interface TestRecord {
  slug: string;
  author: string;
  date: string;
  topics: TopicKey[];
}

const rec = (slug: string, author: string, date: string, topics: TopicKey[] = []): TestRecord => ({
  slug,
  author,
  date,
  topics,
});

// 意図的に順不同
const records: TestRecord[] = [
  rec('2026-11-28-poster', 'ikeda', '2026-11-28', ['poster']),
  rec('2026-10-05-kickoff', 'ikeda', '2026-10-05', ['event', 'shops']),
  rec('2026-11-02-brainstorm', 'committee', '2026-11-02', ['programs']),
  rec('2026-10-20-what-to-sell', 'ikeda-shop', '2026-10-20', ['shops']),
  rec('2026-11-02-another', 'ikeda-shop', '2026-11-02', []),
];

describe('記録の並び順', () => {
  it('日付昇順。同日は slug 順', () => {
    expect(sortRecordsByDate(records).map((r) => r.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
      '2026-11-02-another',
      '2026-11-02-brainstorm',
      '2026-11-28-poster',
    ]);
  });

  it('日付降順', () => {
    expect(sortRecordsByDate(records, 'desc').map((r) => r.slug)).toEqual([
      '2026-11-28-poster',
      '2026-11-02-brainstorm',
      '2026-11-02-another',
      '2026-10-20-what-to-sell',
      '2026-10-05-kickoff',
    ]);
  });

  it('元の配列を変えない', () => {
    const copy = [...records];
    sortRecordsByDate(records);
    expect(records).toEqual(copy);
  });

  it('最新 N 件は新しい順', () => {
    expect(latestRecords(records, 3).map((r) => r.slug)).toEqual([
      '2026-11-28-poster',
      '2026-11-02-brainstorm',
      '2026-11-02-another',
    ]);
    expect(latestRecords([], 3)).toEqual([]);
  });
});

describe('書き手の並び順', () => {
  it('order 昇順。order の無い人は後ろで id 順', () => {
    const sorted = sortPeople([
      { id: 'haru', order: undefined },
      { id: 'ikeda-shop', order: 3 },
      { id: 'aki' },
      { id: 'committee', order: 1 },
      { id: 'ikeda', order: 2 },
    ]);
    expect(sorted.map((p) => p.id)).toEqual(['committee', 'ikeda', 'ikeda-shop', 'aki', 'haru']);
  });

  it('同じ order は id 順', () => {
    const sorted = sortPeople([
      { id: 'b', order: 2 },
      { id: 'c', order: 1 },
      { id: 'a', order: 2 },
    ]);
    expect(sorted.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });

  it('元の配列を変えない', () => {
    const people = [{ id: 'b', order: 2 }, { id: 'a', order: 1 }];
    const copy = [...people];
    sortPeople(people);
    expect(people).toEqual(copy);
  });
});

describe('月ごとのグルーピング', () => {
  it('"2026.10" 形式のラベルで、入力の順を保つ', () => {
    const groups = groupByMonth(sortRecordsByDate(records));
    expect(groups.map((g) => g.label)).toEqual(['2026.10', '2026.11']);
    expect(groups.map((g) => g.month)).toEqual(['2026-10', '2026-11']);
    expect(groups[0].records.map((r) => r.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
    ]);
    expect(groups[1].records).toHaveLength(3);
  });

  it('降順の入力も入力順のまま', () => {
    const groups = groupByMonth(sortRecordsByDate(records, 'desc'));
    expect(groups.map((g) => g.label)).toEqual(['2026.11', '2026.10']);
  });

  it('空なら空', () => {
    expect(groupByMonth([])).toEqual([]);
  });

  it('monthLabel', () => {
    expect(monthLabel('2027-05-30')).toBe('2027.05');
  });
});

describe('書き手・topic での抽出', () => {
  it('書き手ごとの記録（既定は上が古い）', () => {
    expect(recordsByAuthor(records, 'ikeda-shop').map((r) => r.slug)).toEqual([
      '2026-10-20-what-to-sell',
      '2026-11-02-another',
    ]);
    expect(recordsByAuthor(records, 'ikeda', 'desc').map((r) => r.slug)).toEqual([
      '2026-11-28-poster',
      '2026-10-05-kickoff',
    ]);
    expect(recordsByAuthor(records, 'none')).toEqual([]);
  });

  it('topic ごとの記録（既定は新しい順。書き手によらず全記録から拾う）', () => {
    expect(recordsByTopic(records, 'shops').map((r) => r.slug)).toEqual([
      '2026-10-20-what-to-sell',
      '2026-10-05-kickoff',
    ]);
    expect(recordsByTopic(records, 'shops', 'asc').map((r) => r.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
    ]);
    expect(recordsByTopic(records, 'venue')).toEqual([]);
  });

  it('書き手ごとの記録数', () => {
    const counts = countRecordsByAuthor(records);
    expect(counts.get('ikeda')).toBe(2);
    expect(counts.get('ikeda-shop')).toBe(2);
    expect(counts.get('committee')).toBe(1);
    expect(counts.get('none')).toBeUndefined();
  });
});

describe('前後の記録', () => {
  it('全体の時系列で書き手をまたぐ', () => {
    const { prev, next } = adjacentRecords(records, '2026-11-02-brainstorm');
    expect(prev?.slug).toBe('2026-11-02-another');
    expect(next?.slug).toBe('2026-11-28-poster');
  });

  it('最初は prev が無く、最後は next が無い', () => {
    expect(adjacentRecords(records, '2026-10-05-kickoff').prev).toBeUndefined();
    expect(adjacentRecords(records, '2026-11-28-poster').next).toBeUndefined();
  });

  it('存在しない slug は空', () => {
    expect(adjacentRecords(records, 'none')).toEqual({});
  });
});

describe('表示用の文字', () => {
  it('nameWithSan: 個人は「さん」付き、組織は名前だけ', () => {
    expect(nameWithSan({ name: '池田', kind: 'person' })).toBe('池田さん');
    expect(nameWithSan({ name: '黒猫台湾まつり実行委員会', kind: 'group' })).toBe(
      '黒猫台湾まつり実行委員会',
    );
  });

  it('formatDate', () => {
    expect(formatDate('2026-10-05')).toBe('2026.10.05');
    expect(formatDate('2026-10-05', 'short')).toBe('10.05');
    expect(formatDate('2026-10-05', 'ja')).toBe('2026年10月5日');
  });
});
