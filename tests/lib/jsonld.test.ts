import { describe, expect, it } from 'vitest';
import { site, type EventConfig } from '@/config/site';
import type { MakingRecord, PersonSummary } from '@/lib/content/types';
import {
  breadcrumbJsonLd,
  festivalJsonLd,
  personJsonLd,
  recordJsonLd,
  siteJsonLd,
} from '@/lib/jsonld';

const organizationId = 'https://kuronekotaiwan-matsuri.github.io/y2027/#organization';
const websiteId = 'https://kuronekotaiwan-matsuri.github.io/y2027/#website';

const record: MakingRecord = {
  slug: '2026-10-05-kickoff',
  title: '今年も動き始めました',
  titleSegments: ['今年も動き始めました'],
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
  avatar: '/y2027/images/people/ikeda.png',
  bio: '実行委員長。',
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

/** 開催日が未確定の設定（startDate 無し） */
const undecidedEvent: EventConfig = {
  year: 2027,
  edition: 5,
  scheduleLabel: '2027年5月 開催予定',
  scheduleNote: '日程・会場未定',
  goal: { title: '黒猫台湾まつり2027' },
  items: [
    { key: 'date', label: '日程', value: '未定', decided: false },
    { key: 'venue', label: '会場', value: '二子新地のあたり（予定）', decided: false },
  ],
};

describe('siteJsonLd（仕様書 9.5）', () => {
  it('Organization と WebSite を @graph で持ち、@id で参照し合う', () => {
    expect(siteJsonLd['@graph'][0]['@id']).toBe(organizationId);
    expect(siteJsonLd['@graph'][1]['@id']).toBe(websiteId);
  });
});

describe('recordJsonLd（仕様書 9.5）', () => {
  it('個人の書き手は Person。書き手ページの URL と #person の @id を添える', () => {
    const json = recordJsonLd(record, ikeda);
    expect(json['@type']).toBe('Article');
    expect(json.author).toEqual({
      '@type': 'Person',
      '@id': 'https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/#person',
      name: '池田',
      url: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/',
    });
    expect(json.image).toEqual([
      'https://kuronekotaiwan-matsuri.github.io/y2027/images/records/2026-10-05-kickoff/01.jpg',
    ]);
  });

  it('組織の書き手は共通の Organization を @id で参照する', () => {
    const json = recordJsonLd({ ...record, author: 'committee', thumbnail: undefined }, committee);
    expect(json.author).toEqual({ '@id': organizationId });
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
    expect(json.publisher).toEqual({ '@id': organizationId });
  });
});

describe('festivalJsonLd（仕様書 9.5）', () => {
  it('startDate が無ければ undefined（Festival を出さない）', () => {
    expect(festivalJsonLd(undecidedEvent)).toBeUndefined();
  });

  it('startDate があれば Festival。endDate、eventStatus、organizer の @id を持つ', () => {
    const json = festivalJsonLd({
      ...undecidedEvent,
      startDate: '2027-05-29',
      endDate: '2027-05-30',
    });
    expect(json).toBeDefined();
    expect(json?.['@type']).toBe('Festival');
    expect(json?.['@id']).toBe('https://kuronekotaiwan-matsuri.github.io/y2027/#event');
    expect(json?.startDate).toBe('2027-05-29');
    expect(json?.endDate).toBe('2027-05-30');
    expect(json?.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(json?.organizer).toEqual({ '@id': organizationId });
    expect(json?.image).toEqual(['https://kuronekotaiwan-matsuri.github.io/y2027/images/og.png']);
  });

  it('endDate が無ければ startDate と同じ日にする', () => {
    const json = festivalJsonLd({ ...undecidedEvent, startDate: '2027-05-29' });
    expect(json?.endDate).toBe('2027-05-29');
  });

  it('会場名は venueName、無ければ items の会場の表示文', () => {
    const fallback = festivalJsonLd({ ...undecidedEvent, startDate: '2027-05-29' });
    expect(fallback?.location.name).toBe('二子新地のあたり（予定）');
    const named = festivalJsonLd({
      ...undecidedEvent,
      startDate: '2027-05-29',
      venueName: '二子神社',
    });
    expect(named?.location.name).toBe('二子神社');
    expect(named?.location.address.addressLocality).toBe('川崎市高津区');
  });

  it('入場料が未定なので offers を持たない', () => {
    const json = festivalJsonLd({ ...undecidedEvent, startDate: '2027-05-29' });
    expect(json).not.toHaveProperty('offers');
    expect(json).not.toHaveProperty('isAccessibleForFree');
  });

  it('実際の設定（site.event）では開催日が確定しているので Festival が出る', () => {
    const json = festivalJsonLd();
    expect(json?.startDate).toBe(site.event.startDate);
  });
});

describe('breadcrumbJsonLd（仕様書 9.5）', () => {
  it('トップ › できるまで › このページ の 3 件を position 付きで持つ', () => {
    const json = breadcrumbJsonLd({ name: '今年も動き始めました', path: '/making/records/x/' });
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toHaveLength(3);
    expect(json.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(json.itemListElement[0].item).toBe('https://kuronekotaiwan-matsuri.github.io/y2027/');
    expect(json.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'できるまで',
      item: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/',
    });
    expect(json.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: '今年も動き始めました',
      item: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/records/x/',
    });
  });
});

describe('personJsonLd（仕様書 9.5）', () => {
  it('人なら mainEntity は Person。avatar と bio を image / description にする', () => {
    const json = personJsonLd(ikeda, '2026-10-05');
    expect(json['@type']).toBe('ProfilePage');
    expect(json['@id']).toBe('https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/');
    expect(json.dateModified).toBe('2026-10-05');
    expect(json.isPartOf).toEqual({ '@id': websiteId });
    expect(json.mainEntity).toEqual({
      '@type': 'Person',
      '@id': 'https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/#person',
      name: '池田',
      url: 'https://kuronekotaiwan-matsuri.github.io/y2027/making/people/ikeda/',
      image: 'https://kuronekotaiwan-matsuri.github.io/y2027/images/people/ikeda.png',
      description: '実行委員長。',
    });
  });

  it('組織なら mainEntity は共通の Organization の @id 参照', () => {
    const json = personJsonLd(committee);
    expect(json.mainEntity).toEqual({ '@id': organizationId });
    // 記録が無ければ dateModified を持たない
    expect(json).not.toHaveProperty('dateModified');
  });

  it('記録の author の @id と ProfilePage の mainEntity の @id が一致する', () => {
    const article = recordJsonLd(record, ikeda);
    const profile = personJsonLd(ikeda);
    expect(article.author['@id']).toBe(profile.mainEntity['@id']);
  });
});
