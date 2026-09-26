import { describe, expect, it } from 'vitest';
import type { StoryColor, TopicKey } from '@/config/site';
import {
  adjacentRecords,
  adjacentRecordsInStory,
  assignStoryColors,
  countRecordsByStory,
  formatDate,
  groupByMonth,
  latestRecords,
  monthLabel,
  recordsByStory,
  recordsByTopic,
  sortRecordsByDate,
  sortStoriesByOrder,
} from '@/lib/content/select';

interface TestRecord {
  slug: string;
  storySlug: string;
  date: string;
  topics: TopicKey[];
}

const rec = (slug: string, storySlug: string, date: string, topics: TopicKey[] = []): TestRecord => ({
  slug,
  storySlug,
  date,
  topics,
});

// 意図的に順不同
const records: TestRecord[] = [
  rec('2026-11-28-poster', 'matsuri', '2026-11-28', ['poster']),
  rec('2026-10-05-kickoff', 'matsuri', '2026-10-05', ['event', 'shops']),
  rec('2026-11-02-brainstorm', 'matsuri', '2026-11-02', ['programs']),
  rec('2026-10-20-what-to-sell', 'ikeda-shop', '2026-10-20', ['shops']),
  rec('2026-11-02-another', 'ikeda-shop', '2026-11-02', []),
];

const stories = [
  { slug: 'matsuri', kind: 'official' as const },
  { slug: 'ikeda-shop', kind: 'personal' as const },
];

describe('並び順', () => {
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

  it('物語は order 順', () => {
    const sorted = sortStoriesByOrder([
      { slug: 'b', order: 2 },
      { slug: 'c', order: 1 },
      { slug: 'a', order: 2 },
    ]);
    expect(sorted.map((s) => s.slug)).toEqual(['c', 'a', 'b']);
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

describe('物語・topic での抽出', () => {
  it('物語ごとの記録', () => {
    expect(recordsByStory(records, 'ikeda-shop').map((r) => r.slug)).toEqual([
      '2026-10-20-what-to-sell',
      '2026-11-02-another',
    ]);
    expect(recordsByStory(records, 'none')).toEqual([]);
  });

  it('topic ごとの記録（既定は新しい順、個人の記録も含む）', () => {
    expect(recordsByTopic(records, 'shops').map((r) => r.slug)).toEqual([
      '2026-10-20-what-to-sell',
      '2026-10-05-kickoff',
    ]);
  });

  it('officialOnly なら個人の物語の記録を除く（仕様書 3.8）', () => {
    expect(
      recordsByTopic(records, 'shops', { officialOnly: true, stories }).map((r) => r.slug),
    ).toEqual(['2026-10-05-kickoff']);
    expect(recordsByTopic(records, 'venue', { officialOnly: true, stories })).toEqual([]);
  });

  it('物語ごとの記録数', () => {
    const counts = countRecordsByStory(records);
    expect(counts.get('matsuri')).toBe(3);
    expect(counts.get('ikeda-shop')).toBe(2);
    expect(counts.get('none')).toBeUndefined();
  });
});

describe('前後の記録', () => {
  it('全体では物語をまたぐ', () => {
    const { prev, next } = adjacentRecords(records, '2026-11-02-brainstorm');
    expect(prev?.slug).toBe('2026-11-02-another');
    expect(next?.slug).toBe('2026-11-28-poster');
  });

  it('最初は prev が無く、最後は next が無い', () => {
    expect(adjacentRecords(records, '2026-10-05-kickoff').prev).toBeUndefined();
    expect(adjacentRecords(records, '2026-11-28-poster').next).toBeUndefined();
  });

  it('同じ物語の中では物語をまたがない', () => {
    const { prev, next } = adjacentRecordsInStory(records, '2026-11-02-brainstorm');
    expect(prev?.slug).toBe('2026-10-05-kickoff');
    expect(next?.slug).toBe('2026-11-28-poster');
  });

  it('存在しない slug は空', () => {
    expect(adjacentRecords(records, 'none')).toEqual({});
    expect(adjacentRecordsInStory(records, 'none')).toEqual({});
  });
});

describe('物語の色の割り当て', () => {
  const palette: StoryColor[] = [
    { bg: '#B7332A', text: '#FFFBF2' },
    { bg: '#1F3A5F', text: '#F3E4C8' },
    { bg: '#4F7F4A', text: '#FFFBF2' },
    { bg: '#7A3E6B', text: '#FFFBF2' },
  ];

  it('公式は order によらず赤。個人は order 順に紺、緑、紫', () => {
    const colored = assignStoryColors(
      [
        { slug: 'youth', kind: 'personal' as const, order: 3 },
        { slug: 'matsuri', kind: 'official' as const, order: 1 },
        { slug: 'ikeda', kind: 'personal' as const, order: 2 },
        { slug: 'shop-x', kind: 'personal' as const, order: 4 },
      ],
      palette,
    );
    const byId = new Map(colored.map((s) => [s.slug, s.color.bg]));
    expect(byId.get('matsuri')).toBe('#B7332A');
    expect(byId.get('ikeda')).toBe('#1F3A5F');
    expect(byId.get('youth')).toBe('#4F7F4A');
    expect(byId.get('shop-x')).toBe('#7A3E6B');
    // 入力の順序は保つ
    expect(colored.map((s) => s.slug)).toEqual(['youth', 'matsuri', 'ikeda', 'shop-x']);
  });

  it('color 指定はそのまま使い、自動割当の枠を消費しない', () => {
    const colored = assignStoryColors(
      [
        { slug: 'matsuri', kind: 'official' as const, order: 1 },
        { slug: 'custom', kind: 'personal' as const, order: 2, customColor: '#123456' },
        { slug: 'ikeda', kind: 'personal' as const, order: 3 },
      ],
      palette,
    );
    const byId = new Map(colored.map((s) => [s.slug, s.color]));
    expect(byId.get('custom')).toEqual({ bg: '#123456', text: '#FFFBF2' });
    expect(byId.get('ikeda')?.bg).toBe('#1F3A5F');
  });

  it('パレットを使い切ったら繰り返す', () => {
    const colored = assignStoryColors(
      [
        { slug: 'a', kind: 'personal' as const, order: 1 },
        { slug: 'b', kind: 'personal' as const, order: 2 },
        { slug: 'c', kind: 'personal' as const, order: 3 },
        { slug: 'd', kind: 'personal' as const, order: 4 },
      ],
      palette,
    );
    expect(colored.map((s) => s.color.bg)).toEqual(['#1F3A5F', '#4F7F4A', '#7A3E6B', '#1F3A5F']);
  });

  it('既定のパレットは design-system の順', () => {
    const colored = assignStoryColors([
      { slug: 'matsuri', kind: 'official' as const, order: 1 },
      { slug: 'p1', kind: 'personal' as const, order: 2 },
      { slug: 'p2', kind: 'personal' as const, order: 3 },
      { slug: 'p3', kind: 'personal' as const, order: 4 },
      { slug: 'p4', kind: 'personal' as const, order: 5 },
      { slug: 'p5', kind: 'personal' as const, order: 6 },
    ]);
    expect(colored.map((s) => s.color.bg)).toEqual([
      '#B7332A',
      '#1F3A5F',
      '#4F7F4A',
      '#7A3E6B',
      '#2A7F7F',
      '#8F6216',
    ]);
  });
});

describe('日付の表示', () => {
  it('formatDate', () => {
    expect(formatDate('2026-10-05')).toBe('2026.10.05');
    expect(formatDate('2026-10-05', 'short')).toBe('10.05');
    expect(formatDate('2026-10-05', 'ja')).toBe('2026年10月5日');
  });
});
