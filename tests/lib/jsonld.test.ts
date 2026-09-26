import { describe, expect, it } from 'vitest';
import type { MakingRecord, PersonSummary } from '@/lib/content/types';
import { recordJsonLd, siteJsonLd } from '@/lib/jsonld';

const record: MakingRecord = {
  slug: '2026-10-05-kickoff',
  title: '今年も動き始めました',
  date: '2026-10-05',
  author: 'ikeda',
  summary: '要約。',
  tags: [],
  topics: [],
  thumbnail: '/y2027/images/records/2026-10-05-kickoff/01.jpg',
  instagram: [],
  isDraft: false,
  bodyHtml: '<p>本文</p>',
  filePath: 'content/records/2026-10-05-kickoff.md',
};

const ikeda: PersonSummary = {
  id: 'ikeda',
  name: '池田',
  role: 'committee',
  kind: 'person',
  isDraft: false,
  filePath: 'content/people/ikeda.md',
};

const committee: PersonSummary = {
  id: 'committee',
  name: '黒猫台湾まつり実行委員会',
  role: 'committee',
  kind: 'group',
  isDraft: false,
  filePath: 'content/people/committee.md',
};

describe('recordJsonLd（仕様書 9.5）', () => {
  it('個人の書き手は Person。書き手ページの URL を添える', () => {
    const json = recordJsonLd(record, ikeda);
    expect(json['@type']).toBe('Article');
    expect(json.author).toEqual({
      '@type': 'Person',
      name: '池田',
      url: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/',
    });
    expect(json.image).toEqual([
      'https://kuronekotaiwan-matsuri.github.io/y2027/images/records/2026-10-05-kickoff/01.jpg',
    ]);
  });

  it('組織の書き手は Organization', () => {
    const json = recordJsonLd({ ...record, author: 'committee', thumbnail: undefined }, committee);
    expect(json.author['@type']).toBe('Organization');
    expect(json.author.name).toBe('黒猫台湾まつり実行委員会');
    // thumbnail が無ければ共通画像
    expect(json.image).toEqual(['https://kuronekotaiwan-matsuri.github.io/y2027/images/og.png']);
  });

  it('isPartOf は「できるまで」', () => {
    const json = recordJsonLd(record, ikeda);
    expect(json.isPartOf).toEqual({
      '@type': 'CreativeWorkSeries',
      name: '黒猫台湾まつりができるまで',
      url: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/',
    });
    expect(json.publisher).toEqual({ '@id': `${siteJsonLd['@graph'][0]['@id']}` });
  });
});
