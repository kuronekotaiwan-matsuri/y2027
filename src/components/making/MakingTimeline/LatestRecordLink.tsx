'use client';

import type { ReactNode } from 'react';
import {
  matchesSelectedAuthor,
  resolveSelectedAuthor,
  useSelectedAuthorRaw,
} from './selectedAuthor';

interface LatestRecordLinkProps {
  /** 全記録の author（記録1件につき1つ）。絞り込み後に記録が残るかの判定に使う */
  authors: string[];
  /** 登録済みの書き手 ID（MakingTimeline に渡す people と同じもの） */
  peopleIds: string[];
  /** ジャンプ先（最新の記録）の id。MakingTimeline の latestId と同じ値 */
  targetId: string;
  className?: string;
  children: ReactNode;
}

/**
 * 「最新の記録へ」のリンク（/making/ の見出し脇）。
 * 顔で絞った結果が 0 件のときは hidden にする。選択状態は MakingTimeline と同じ URL の ?by= を読む
 */
export default function LatestRecordLink({
  authors,
  peopleIds,
  targetId,
  className,
  children,
}: LatestRecordLinkProps) {
  const selected = resolveSelectedAuthor(peopleIds, useSelectedAuthorRaw());
  const hasVisibleRecord = authors.some((author) => matchesSelectedAuthor(author, selected));
  return (
    <a className={className} href={`#${targetId}`} hidden={!hasVisibleRecord}>
      {children}
    </a>
  );
}
