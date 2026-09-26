import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { StorySummary } from '@/lib/content/types';
import styles from './StoryBadge.module.css';

interface StoryBadgeProps {
  story: Pick<StorySummary, 'slug' | 'title' | 'kind' | 'color'>;
  /** 物語名の代わりに出す文字（例: 「公式」「個人の活動」） */
  label?: string;
  /** 物語ページへのリンクにする。カード全体がリンクのときは使わない（入れ子になる） */
  link?: boolean;
  /** personal のときの「個人」の印。label を出すときは省略できる */
  showKindMark?: boolean;
}

/** 物語バッジ。物語の色を背景にし、personal には「個人」の印を付ける（仕様書 3.8） */
export default function StoryBadge({
  story,
  label,
  link = false,
  showKindMark = label === undefined,
}: StoryBadgeProps) {
  const style = {
    '--badge-bg': story.color.bg,
    '--badge-text': story.color.text,
  } as CSSProperties;
  const content = (
    <>
      <span>{label ?? story.title}</span>
      {showKindMark && story.kind === 'personal' && (
        <span className={styles.personalMark}>個人</span>
      )}
    </>
  );
  const className = `${styles.badge} ${styles.badgeStory}`;

  if (link) {
    return (
      <Link
        href={`/making/stories/${story.slug}/`}
        className={className}
        style={style}
        data-kind={story.kind}
      >
        {content}
      </Link>
    );
  }
  return (
    <span className={className} style={style} data-kind={story.kind}>
      {content}
    </span>
  );
}
