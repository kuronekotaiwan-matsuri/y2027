import { describe, expect, it } from 'vitest';
import { loadContent } from '@/lib/content/load';

/**
 * リポジトリの content/stories/ そのものを読む。
 * 本番ビルド（draft 除外）と開発時（draft 込み）の両方で検証が通ることを確かめる。
 * 書き手が front-matter を間違えたとき、build より先にここで気づける。
 */
describe('content/stories/（実データ）', () => {
  it('本番（draft 除外）で検証が通り、公式の物語が1本ある', () => {
    const data = loadContent({ includeDrafts: false, warn: () => {} });
    const official = data.stories.filter((story) => story.kind === 'official');
    expect(official.map((story) => story.slug)).toEqual(['matsuri']);
    expect(official[0].color.bg).toBe('#B7332A');
    expect(data.stories.every((story) => !story.isDraft)).toBe(true);
    expect(data.records.every((record) => !record.isDraft)).toBe(true);
  });

  it('開発時（draft 込み）でも検証が通り、仮の個人の物語は紺で isDraft', () => {
    const data = loadContent({ includeDrafts: true, warn: () => {} });
    const personal = data.stories.find((story) => story.slug === 'sample-personal');
    expect(personal?.kind).toBe('personal');
    expect(personal?.isDraft).toBe(true);
    expect(personal?.color.bg).toBe('#1F3A5F');
    expect(
      data.records.filter((record) => record.storySlug === 'sample-personal').every((r) => r.isDraft),
    ).toBe(true);
    // 日付昇順
    const dates = data.records.map((record) => record.date);
    expect(dates).toEqual([...dates].sort());
  });
});
