import { describe, expect, it } from 'vitest';
import {
  FACES_ALL,
  matchesSelectedAuthor,
  resolveSelectedAuthor,
} from '@/components/making/MakingTimeline/selectedAuthor';

/**
 * /making/ の「顔で絞る」の選択状態（URL の ?by=）。
 * MakingTimeline（一覧）と LatestRecordLink（「最新の記録へ」の表示・非表示）が同じ判定を使う。
 */
describe('resolveSelectedAuthor: URL の値を登録済みの書き手に解決する', () => {
  const ids = ['committee', 'ikeda'];

  it('登録済みの ID はそのまま', () => {
    expect(resolveSelectedAuthor(ids, 'ikeda')).toBe('ikeda');
  });

  it('無い ID・空・「すべて」は FACES_ALL', () => {
    expect(resolveSelectedAuthor(ids, 'nobody')).toBe(FACES_ALL);
    expect(resolveSelectedAuthor(ids, '')).toBe(FACES_ALL);
    expect(resolveSelectedAuthor(ids, FACES_ALL)).toBe(FACES_ALL);
  });

  it('書き手が 0 人なら常に FACES_ALL', () => {
    expect(resolveSelectedAuthor([], 'ikeda')).toBe(FACES_ALL);
  });
});

describe('matchesSelectedAuthor: 記録がいまの選択に含まれるか', () => {
  const authors = ['ikeda', 'ikeda', 'haru'];

  it('「すべて」なら全件', () => {
    expect(authors.filter((a) => matchesSelectedAuthor(a, FACES_ALL))).toHaveLength(3);
  });

  it('書き手を選ぶとその人の記録だけ', () => {
    expect(authors.filter((a) => matchesSelectedAuthor(a, 'ikeda'))).toHaveLength(2);
    expect(authors.filter((a) => matchesSelectedAuthor(a, 'haru'))).toHaveLength(1);
  });

  it('記録が 0 件の書き手（committee）を選ぶと 1 件も残らない → 「最新の記録へ」は出さない', () => {
    expect(authors.some((a) => matchesSelectedAuthor(a, 'committee'))).toBe(false);
  });
});
