/**
 * phase（making / event / archive）による切り替え（仕様書 2.4、5.1）。
 * ページはこの関数の結果に従って並べるだけにし、判断を書かない。
 */
import type { EventConfig, GoalMarker, Phase } from '@/config/site';

export type HomeSectionKey = 'hero' | 'making' | 'guide' | 'about' | 'join';

const HOME_SECTION_ORDER: Record<Phase, HomeSectionKey[]> = {
  making: ['hero', 'making', 'guide', 'about', 'join'],
  event: ['hero', 'guide', 'making', 'about', 'join'],
  archive: ['hero', 'making', 'guide', 'about', 'join'],
};

/** トップのセクションの並び（上から） */
export function getHomeSectionOrder(phase: Phase): HomeSectionKey[] {
  return [...HOME_SECTION_ORDER[phase]];
}

export interface HeroCta {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
  external?: boolean;
}

export interface HeroLinks {
  making: string;
  shops: string;
  programs: string;
  instagram: string;
}

export interface HeroPlan {
  /** 「いま」（最新の記録）を主に置く */
  showNow: boolean;
  /** 開催情報の項目（日程・時間・会場・入場料）を主に置く */
  showEventInfo: boolean;
  /** 「開催しました」を主に置く */
  showHeld: boolean;
  /** できるまでへの小さな導線を添える */
  showMakingLink: boolean;
  ctas: HeroCta[];
}

/** ヒーローに何を出すか */
export function getHeroPlan(phase: Phase, links: HeroLinks): HeroPlan {
  switch (phase) {
    case 'event':
      return {
        showNow: false,
        showEventInfo: true,
        showHeld: false,
        showMakingLink: true,
        ctas: [
          { label: '出店情報を見る', href: links.shops, variant: 'primary' },
          { label: 'プログラムを見る', href: links.programs, variant: 'secondary' },
        ],
      };
    case 'archive':
      return {
        showNow: false,
        showEventInfo: false,
        showHeld: true,
        showMakingLink: false,
        ctas: [{ label: 'できるまでを最初から読む', href: links.making, variant: 'primary' }],
      };
    case 'making':
    default:
      return {
        showNow: true,
        showEventInfo: false,
        showHeld: false,
        showMakingLink: false,
        ctas: [
          { label: 'できるまでを見る', href: links.making, variant: 'primary' },
          {
            label: 'Instagramで日々の様子を見る',
            href: links.instagram,
            variant: 'secondary',
            external: true,
          },
        ],
      };
  }
}

/** 開催情報と案内メニューのセクション見出し */
export function getGuideSectionTitle(phase: Phase, year: number): string {
  return phase === 'archive' ? `${year}年の記録` : '開催情報と案内';
}

/**
 * タイムライン最下部のゴールマーカー。
 * 開催後（archive）に heldLabel があれば、日付・状態を持たない開催の表示（title だけ）に置き換わる
 */
export function getGoalMarker(event: EventConfig, phase: Phase): GoalMarker {
  if (phase === 'archive' && event.heldLabel) {
    return { title: event.heldLabel };
  }
  return { ...event.goal };
}
