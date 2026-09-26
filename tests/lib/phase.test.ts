import { describe, expect, it } from 'vitest';
import type { EventConfig } from '@/config/site';
import {
  getGoalMarker,
  getGuideSectionTitle,
  getHeroPlan,
  getHomeSectionOrder,
} from '@/lib/phase';

describe('トップのセクション順（仕様書 5.1）', () => {
  it('making: ヒーロー → できるまで → 開催情報と案内 → まつりとは → 関わる', () => {
    expect(getHomeSectionOrder('making')).toEqual(['hero', 'making', 'guide', 'about', 'join']);
  });

  it('event: ヒーロー → 開催情報と案内 → できるまで → まつりとは → 関わる', () => {
    expect(getHomeSectionOrder('event')).toEqual(['hero', 'guide', 'making', 'about', 'join']);
  });

  it('archive: ヒーロー → できるまで → 開催情報と案内 → まつりとは → 関わる', () => {
    expect(getHomeSectionOrder('archive')).toEqual(['hero', 'making', 'guide', 'about', 'join']);
  });

  it('返した配列を変えても内部の定義は変わらない', () => {
    getHomeSectionOrder('making').reverse();
    expect(getHomeSectionOrder('making')[0]).toBe('hero');
  });
});

describe('ヒーローの内容', () => {
  const links = {
    making: '/making/',
    shops: '/shops/',
    programs: '/programs/',
    instagram: 'https://www.instagram.com/x/',
  };

  it('making: 「いま」を主に置き、CTA はできるまで', () => {
    const plan = getHeroPlan('making', links);
    expect(plan.showNow).toBe(true);
    expect(plan.showEventInfo).toBe(false);
    expect(plan.showHeld).toBe(false);
    expect(plan.ctas[0]).toEqual({ label: 'できるまでを見る', href: '/making/', variant: 'primary' });
    expect(plan.ctas[1]?.external).toBe(true);
  });

  it('event: 開催情報を主に置き、CTA は出店情報とプログラム。できるまでは小さく残す', () => {
    const plan = getHeroPlan('event', links);
    expect(plan.showNow).toBe(false);
    expect(plan.showEventInfo).toBe(true);
    expect(plan.showMakingLink).toBe(true);
    expect(plan.ctas.map((c) => c.href)).toEqual(['/shops/', '/programs/']);
  });

  it('archive: 開催しましたを主に置き、CTA はできるまでを最初から', () => {
    const plan = getHeroPlan('archive', links);
    expect(plan.showHeld).toBe(true);
    expect(plan.showNow).toBe(false);
    expect(plan.ctas).toEqual([
      { label: 'できるまでを最初から読む', href: '/making/', variant: 'primary' },
    ]);
  });
});

describe('ゴールマーカーと見出し', () => {
  const event: EventConfig = {
    year: 2027,
    edition: 5,
    scheduleLabel: '2027年5月 開催予定',
    scheduleNote: '日程・会場未定',
    goal: { label: '2027.05 黒猫台湾まつり2027 開催（予定）', note: '日程が決まったら' },
    items: [],
  };

  it('開催前は設定のゴールをそのまま使う', () => {
    expect(getGoalMarker(event, 'making')).toEqual(event.goal);
    expect(getGoalMarker(event, 'event')).toEqual(event.goal);
  });

  it('archive で heldLabel があれば開催の表示に置き換わる', () => {
    expect(getGoalMarker({ ...event, heldLabel: '2027.05.29 開催しました' }, 'archive')).toEqual({
      label: '2027.05.29 開催しました',
    });
    // heldLabel が無ければ従来どおり
    expect(getGoalMarker(event, 'archive')).toEqual(event.goal);
  });

  it('案内セクションの見出しは archive だけ変わる', () => {
    expect(getGuideSectionTitle('making', 2027)).toBe('開催情報と案内');
    expect(getGuideSectionTitle('event', 2027)).toBe('開催情報と案内');
    expect(getGuideSectionTitle('archive', 2027)).toBe('2027年の記録');
  });
});
