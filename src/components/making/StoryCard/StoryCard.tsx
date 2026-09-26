import Link from 'next/link';
import StoryBadge from '@/components/making/StoryBadge/StoryBadge';
import { monthLabel } from '@/lib/content/select';
import type { StorySummary } from '@/lib/content/types';
import styles from './StoryCard.module.css';

interface StoryCardProps {
  story: StorySummary;
  recordCount: number;
}

/** 物語カード（トップの物語一覧、物語ページの「他の物語」） */
export default function StoryCard({ story, recordCount }: StoryCardProps) {
  const href = `/making/stories/${story.slug}/`;
  return (
    <article className={styles.card}>
      {story.cover && (
        <div className={styles.cardThumb}>
          <img src={story.cover} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <StoryBadge story={story} label={story.kind === 'official' ? '公式' : '個人の活動'} />
        </div>
        <h3 className={styles.cardTitle}>
          <Link href={href}>{story.title}</Link>
        </h3>
        {story.subtitle && <p className={styles.cardSummary}>{story.subtitle}</p>}
        <div className={styles.cardStats}>
          <span>{story.owner}</span>
          <span>
            {monthLabel(story.startDate)}〜 {story.status === 'active' ? '進行中' : '完了'}
          </span>
          <span>記録 {recordCount}件</span>
        </div>
      </div>
    </article>
  );
}
