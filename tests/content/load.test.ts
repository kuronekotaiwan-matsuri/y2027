import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ContentValidationError, loadContent } from '@/lib/content/load';

const fixturesRoot = fileURLToPath(new URL('../fixtures/', import.meta.url));

function fixture(name: string) {
  return {
    storiesDir: `${fixturesRoot}${name}/stories`,
    publicDir: `${fixturesRoot}${name}/public`,
    basePath: '/y2027',
  };
}

function loadExpectingError(name: string): ContentValidationError {
  let caught: unknown;
  try {
    loadContent({ ...fixture(name), includeDrafts: true, warn: () => {} });
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(ContentValidationError);
  return caught as ContentValidationError;
}

describe('loadContent: 正常系（本番 = draft を除外）', () => {
  const warnings: string[] = [];
  const data = loadContent({
    ...fixture('valid'),
    includeDrafts: false,
    warn: (message) => warnings.push(message),
  });

  it('物語を order 順に読み、draft の物語は除外する', () => {
    expect(data.stories.map((story) => story.slug)).toEqual(['matsuri', 'ikeda-shop']);
    expect(data.stories.every((story) => !story.isDraft)).toBe(true);
  });

  it('記録を日付昇順に読み、draft の記録と draft の物語の記録は除外する', () => {
    expect(data.records.map((record) => record.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
      '2026-11-15-youth',
    ]);
  });

  it('公式は赤、個人の1本目は紺', () => {
    const [official, personal] = data.stories;
    expect(official.kind).toBe('official');
    expect(official.color).toEqual({ bg: '#B7332A', text: '#FFFBF2' });
    expect(personal.kind).toBe('personal');
    expect(personal.color).toEqual({ bg: '#1F3A5F', text: '#F3E4C8' });
  });

  it('YAML の日付を YYYY-MM-DD の文字列にそろえる', () => {
    expect(data.stories[0].startDate).toBe('2026-10-01');
    expect(data.records[0].date).toBe('2026-10-05');
  });

  it('thumbnail と cover に basePath を付ける', () => {
    expect(data.stories[0].cover).toBe('/y2027/images/stories/matsuri/cover.jpg');
    expect(data.records[0].thumbnail).toBe(
      '/y2027/images/stories/matsuri/2026-10-05-kickoff/01.jpg',
    );
  });

  it('instagram と tags は文字列1つでも配列にする', () => {
    expect(data.records[0].instagram).toEqual(['https://www.instagram.com/p/abc123/']);
    expect(data.records[2].tags).toEqual(['試作中']);
    expect(data.records[2].instagram).toEqual([]);
  });

  it('topics と author を読む', () => {
    expect(data.records[0].topics).toEqual(['event', 'shops']);
    expect(data.records[0].author).toEqual({ name: '池田', role: 'committee' });
    expect(data.records[2].author.role).toBe('youth');
  });

  it('本文を HTML にし、画像とリンクに basePath を付ける', () => {
    expect(data.stories[0].bodyHtml).toContain('<strong>太字</strong>');
    expect(data.records[0].bodyHtml).toContain(
      'src="/y2027/images/stories/matsuri/2026-10-05-kickoff/01.jpg"',
    );
    expect(data.records[0].bodyHtml).toContain('href="/y2027/making/"');
  });

  it('存在しない画像は警告する（ビルドは止めない）', () => {
    // cover.jpg は存在する。thumbnail と本文の 01.jpg は存在しない
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('[thumbnail]');
    expect(warnings[0]).toContain('/images/stories/matsuri/2026-10-05-kickoff/01.jpg');
    expect(warnings[1]).toContain('[本文]');
    expect(warnings.some((w) => w.includes('cover.jpg'))).toBe(false);
  });

  it('filePath はリポジトリ基準の相対パス', () => {
    expect(data.records[0].filePath).toBe(
      'tests/fixtures/valid/stories/matsuri/2026-10-05-kickoff.md',
    );
    expect(data.stories[0].filePath).toBe('tests/fixtures/valid/stories/matsuri/story.md');
  });
});

describe('loadContent: 開発時（draft を含める）', () => {
  const data = loadContent({ ...fixture('valid'), includeDrafts: true, warn: () => {} });

  it('draft の物語と記録も含め、isDraft を付ける', () => {
    expect(data.stories.map((story) => story.slug)).toEqual([
      'matsuri',
      'ikeda-shop',
      'draft-story',
    ]);
    expect(data.stories[2].isDraft).toBe(true);
    expect(data.records.map((record) => record.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
      '2026-11-02-brainstorm',
      '2026-11-15-youth',
      '2026-12-01-secret',
    ]);
    const bySlug = new Map(data.records.map((record) => [record.slug, record]));
    expect(bySlug.get('2026-10-05-kickoff')?.isDraft).toBe(false);
    expect(bySlug.get('2026-11-02-brainstorm')?.isDraft).toBe(true);
    // 物語が draft なら、その記録も draft 扱い
    expect(bySlug.get('2026-12-01-secret')?.isDraft).toBe(true);
  });
});

describe('loadContent: 異常系はビルドを失敗させる', () => {
  it('必須項目の欠落（ファイルパスと項目名を含む）', () => {
    const error = loadExpectingError('invalid-missing');
    expect(error.message).toContain('invalid-missing/stories/matsuri/2026-10-05-kickoff.md');
    expect(error.message).toContain('summary');
    expect(error.issues).toEqual([
      expect.objectContaining({ field: 'summary' }),
    ]);
  });

  it('語彙にない role', () => {
    const error = loadExpectingError('invalid-role');
    expect(error.issues).toEqual([
      expect.objectContaining({
        file: 'tests/fixtures/invalid-role/stories/matsuri/2026-10-05-kickoff.md',
        field: 'author.role',
      }),
    ]);
    expect(error.message).toContain('committee');
  });

  it('語彙にない topics', () => {
    const error = loadExpectingError('invalid-topics');
    expect(error.issues).toEqual([expect.objectContaining({ field: 'topics.1' })]);
    expect(error.message).toContain('food');
  });

  it('不正な kind / status / 日付形式をまとめて報告する', () => {
    const error = loadExpectingError('invalid-values');
    const fields = error.issues.map((issue) => `${issue.file}:${issue.field}`);
    expect(fields).toContain('tests/fixtures/invalid-values/stories/matsuri/story.md:kind');
    expect(fields).toContain('tests/fixtures/invalid-values/stories/matsuri/story.md:status');
    expect(fields).toContain(
      'tests/fixtures/invalid-values/stories/other/2026-10-05-bad-date.md:date',
    );
    expect(error.message).toContain('YYYY-MM-DD');
  });

  it('記録 slug の重複', () => {
    const error = loadExpectingError('duplicate-slug');
    expect(error.issues).toHaveLength(1);
    expect(error.issues[0].file).toBe(
      'tests/fixtures/duplicate-slug/stories/beta/2026-10-05-kickoff.md',
    );
    expect(error.message).toContain('重複');
    expect(error.message).toContain('stories/alpha/2026-10-05-kickoff.md');
  });

  it('story.md のないフォルダ', () => {
    const error = loadExpectingError('no-story');
    expect(error.issues).toEqual([
      expect.objectContaining({ file: 'tests/fixtures/no-story/stories/orphan/story.md' }),
    ]);
    expect(error.message).toContain('story.md がありません');
  });

  it('content フォルダが無ければ空を返す', () => {
    const data = loadContent({ ...fixture('does-not-exist'), warn: () => {} });
    expect(data).toEqual({ stories: [], records: [] });
  });
});
