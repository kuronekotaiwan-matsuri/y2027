import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ContentValidationError, loadContent } from '@/lib/content/load';

const fixturesRoot = fileURLToPath(new URL('../fixtures/', import.meta.url));

function fixture(name: string) {
  return {
    peopleDir: `${fixturesRoot}${name}/people`,
    recordsDir: `${fixturesRoot}${name}/records`,
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

  it('書き手を order → id 順に読み、draft の書き手は除外する', () => {
    expect(data.people.map((person) => person.id)).toEqual(['committee', 'ikeda', 'haru']);
    expect(data.people.every((person) => !person.isDraft)).toBe(true);
  });

  it('記録を日付昇順に読み、draft の記録と draft の書き手の記録は除外する', () => {
    expect(data.records.map((record) => record.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-11-15-youth',
    ]);
    expect(data.records.every((record) => !record.isDraft)).toBe(true);
  });

  it('kind の既定は person。group は組織', () => {
    const byId = new Map(data.people.map((person) => [person.id, person]));
    expect(byId.get('committee')?.kind).toBe('group');
    expect(byId.get('ikeda')?.kind).toBe('person');
    expect(byId.get('haru')?.order).toBeUndefined();
    expect(byId.get('haru')?.instagram).toBe('https://www.instagram.com/haru/');
  });

  it('shortName は任意。書いた人だけが持つ', () => {
    const byId = new Map(data.people.map((person) => [person.id, person]));
    expect(byId.get('committee')?.shortName).toBe('実行委員会');
    expect(byId.get('ikeda')?.shortName).toBeUndefined();
  });

  it('YAML の日付を YYYY-MM-DD の文字列にそろえる', () => {
    expect(data.records[0].date).toBe('2026-10-05');
  });

  it('avatar と thumbnail に basePath を付ける', () => {
    expect(data.people[1].avatar).toBe('/y2027/images/people/ikeda.jpg');
    expect(data.people[0].avatar).toBeUndefined();
    expect(data.records[0].thumbnail).toBe('/y2027/images/records/2026-10-05-kickoff/01.jpg');
  });

  it('instagram と tags は文字列1つでも配列にする', () => {
    expect(data.records[0].instagram).toEqual(['https://www.instagram.com/p/abc123/']);
    expect(data.records[1].tags).toEqual(['試作中']);
    expect(data.records[1].instagram).toEqual([]);
  });

  it('topics と author（書き手の ID）を読む', () => {
    expect(data.records[0].topics).toEqual(['event', 'shops']);
    expect(data.records[0].author).toBe('ikeda');
    expect(data.records[1].author).toBe('haru');
  });

  it('本文を HTML にし、画像とリンクに basePath を付ける', () => {
    expect(data.people[1].bodyHtml).toContain('<strong>太字</strong>');
    expect(data.people[1].bodyHtml).toContain('href="/y2027/making/"');
    expect(data.people[0].bodyHtml).toBe('');
    expect(data.records[0].bodyHtml).toContain(
      'src="/y2027/images/records/2026-10-05-kickoff/01.jpg"',
    );
    expect(data.records[0].bodyHtml).toContain('href="/y2027/making/"');
  });

  it('存在しない画像は警告する（ビルドは止めない）', () => {
    // ikeda.jpg は存在する。haru の avatar、kickoff の thumbnail と本文の 01.jpg は存在しない
    expect(warnings).toHaveLength(3);
    expect(warnings[0]).toContain('people/haru.md [avatar]');
    expect(warnings[0]).toContain('/images/people/haru.jpg');
    expect(warnings[1]).toContain('[thumbnail]');
    expect(warnings[1]).toContain('/images/records/2026-10-05-kickoff/01.jpg');
    expect(warnings[2]).toContain('[本文]');
    expect(warnings.some((w) => w.includes('ikeda.jpg'))).toBe(false);
  });

  it('filePath はリポジトリ基準の相対パス', () => {
    expect(data.records[0].filePath).toBe('tests/fixtures/valid/records/2026-10-05-kickoff.md');
    expect(data.people[1].filePath).toBe('tests/fixtures/valid/people/ikeda.md');
  });
});

describe('loadContent: 開発時（draft を含める）', () => {
  const data = loadContent({ ...fixture('valid'), includeDrafts: true, warn: () => {} });

  it('draft の書き手と記録も含め、isDraft を付ける', () => {
    expect(data.people.map((person) => person.id)).toEqual([
      'committee',
      'ikeda',
      'ikeda-shop',
      'haru',
    ]);
    expect(data.people[2].isDraft).toBe(true);
    expect(data.records.map((record) => record.slug)).toEqual([
      '2026-10-05-kickoff',
      '2026-10-20-what-to-sell',
      '2026-11-02-brainstorm',
      '2026-11-15-youth',
    ]);
    const bySlug = new Map(data.records.map((record) => [record.slug, record]));
    expect(bySlug.get('2026-10-05-kickoff')?.isDraft).toBe(false);
    expect(bySlug.get('2026-11-02-brainstorm')?.isDraft).toBe(true);
    // 書き手が draft なら、その記録も draft 扱い
    expect(bySlug.get('2026-10-20-what-to-sell')?.isDraft).toBe(true);
  });
});

describe('loadContent: 異常系はビルドを失敗させる', () => {
  it('必須項目の欠落（ファイルパスと項目名を含む）', () => {
    const error = loadExpectingError('invalid-missing');
    expect(error.message).toContain('invalid-missing/people/noname.md');
    expect(error.message).toContain('invalid-missing/records/2026-10-05-kickoff.md');
    expect(error.issues).toEqual([
      expect.objectContaining({ field: 'name', message: '必須項目 name がありません' }),
      expect.objectContaining({ field: 'summary', message: '必須項目 summary がありません' }),
    ]);
  });

  it('語彙にない role（書き手側のエラーだけを報告し、その記録では二重に報告しない）', () => {
    const error = loadExpectingError('invalid-role');
    expect(error.issues).toEqual([
      expect.objectContaining({
        file: 'tests/fixtures/invalid-role/people/ikeda.md',
        field: 'role',
      }),
    ]);
    expect(error.message).toContain('committee');
    expect(error.message).toContain('"boss"');
  });

  it('語彙にない topics', () => {
    const error = loadExpectingError('invalid-topics');
    expect(error.issues).toEqual([expect.objectContaining({ field: 'topics.1' })]);
    expect(error.message).toContain('food');
  });

  it('不正な kind / instagram / ID / 日付形式 / 旧形式の author をまとめて報告する', () => {
    const error = loadExpectingError('invalid-values');
    const fields = error.issues.map((issue) => `${issue.file}:${issue.field ?? ''}`);
    expect(fields).toContain('tests/fixtures/invalid-values/people/bad_id.md:');
    expect(fields).toContain('tests/fixtures/invalid-values/people/committee.md:kind');
    expect(fields).toContain('tests/fixtures/invalid-values/people/lin.md:instagram');
    expect(fields).toContain('tests/fixtures/invalid-values/records/2026-10-05-bad-date.md:date');
    expect(fields).toContain(
      'tests/fixtures/invalid-values/records/2026-10-06-old-author.md:author',
    );
    expect(error.message).toContain('英小文字・数字・ハイフン');
    expect(error.message).toContain('person（個人）, group（組織）');
    expect(error.message).toContain('https://');
    expect(error.message).toContain('YYYY-MM-DD');
    expect(error.message).toContain('書き手のID');
  });

  it('content/people/ に無い author（登録されている ID の一覧を添える）', () => {
    const error = loadExpectingError('unknown-author');
    expect(error.issues).toEqual([
      expect.objectContaining({
        file: 'tests/fixtures/unknown-author/records/2026-10-05-kickoff.md',
        field: 'author',
        message:
          'author "ikeda2" は content/people/ にありません（登録されているID: committee, ikeda, ikeda-shop）',
      }),
    ]);
  });

  it('書き手が1人も登録されていないときは「なし」と示す', () => {
    const error = loadExpectingError('no-people');
    expect(error.issues).toHaveLength(1);
    expect(error.issues[0].message).toContain('登録されているID: なし');
  });

  it('content フォルダが無ければ空を返す', () => {
    const data = loadContent({ ...fixture('does-not-exist'), warn: () => {} });
    expect(data).toEqual({ people: [], records: [] });
  });
});
