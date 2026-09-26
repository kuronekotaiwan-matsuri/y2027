import { describe, expect, it } from 'vitest';
import { loadContent } from '@/lib/content/load';

/**
 * リポジトリの content/people/ と content/records/ そのものを読む。
 * 本番ビルド（draft 除外）と開発時（draft 込み）の両方で検証が通ることを確かめる。
 * 書き手が front-matter を間違えたとき、build より先にここで気づける。
 */
describe('content/（実データ）', () => {
  it('本番（draft 除外）で検証が通り、公開する書き手は実行委員会と池田', () => {
    const data = loadContent({ includeDrafts: false, warn: () => {} });
    expect(data.people.map((person) => person.id)).toEqual(['committee', 'ikeda']);
    const committee = data.people[0];
    expect(committee.kind).toBe('group');
    expect(committee.role).toBe('committee');
    expect(data.people.every((person) => !person.isDraft)).toBe(true);
    expect(data.records.every((record) => !record.isDraft)).toBe(true);
    // 記録の author はすべて公開中の書き手
    const ids = new Set(data.people.map((person) => person.id));
    expect(data.records.every((record) => ids.has(record.author))).toBe(true);
  });

  it('開発時（draft 込み）でも検証が通り、イケダ（出店者）とその記録は isDraft', () => {
    const data = loadContent({ includeDrafts: true, warn: () => {} });
    expect(data.people.map((person) => person.id)).toEqual(['committee', 'ikeda', 'ikeda-shop']);
    const shop = data.people.find((person) => person.id === 'ikeda-shop');
    expect(shop?.isDraft).toBe(true);
    expect(shop?.role).toBe('shop');
    const shopRecords = data.records.filter((record) => record.author === 'ikeda-shop');
    expect(shopRecords.length).toBeGreaterThan(0);
    expect(shopRecords.every((record) => record.isDraft)).toBe(true);
    // 日付昇順
    const dates = data.records.map((record) => record.date);
    expect(dates).toEqual([...dates].sort());
  });
});
