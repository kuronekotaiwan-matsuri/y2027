import type { CSSProperties } from 'react';
import StoryBadge from '@/components/making/StoryBadge/StoryBadge';
import { formatDate } from '@/lib/content/select';
import type { StorySummary } from '@/lib/content/types';
import styles from './StoryHeader.module.css';

interface StoryHeaderProps {
  story: StorySummary;
  recordCount: number;
}

/** 物語ページのヘッダー（仕様書 5.5）: カバー、タイトル、副題、主体、開始日、状態、記録数 */
export default function StoryHeader({ story, recordCount }: StoryHeaderProps) {
  // 見出しのマーカーに物語の色を使う（design-system.md 2章）
  const style = { '--story-color': story.color.bg } as CSSProperties;
  return (
    <header className={styles.storyHeader} style={style}>
      {story.cover && (
        <div className={styles.storyCover}>
          <img src={story.cover} alt="" decoding="async" />
        </div>
      )}
      <div className={styles.storyMeta}>
        <StoryBadge story={story} label={story.kind === 'official' ? '公式' : '個人の活動'} />
      </div>
      <h1 className={styles.storyTitle}>
        <span className={styles.storyTitleText}>{story.title}</span>
      </h1>
      {story.subtitle && <p className={styles.storySubtitle}>{story.subtitle}</p>}
      <dl className={styles.storyStats}>
        <div>
          <dt>主体</dt>
          <dd>{story.owner}</dd>
        </div>
        <div>
          <dt>開始</dt>
          <dd>
            <time dateTime={story.startDate}>{formatDate(story.startDate, 'ja')}</time>
          </dd>
        </div>
        <div>
          <dt>状態</dt>
          <dd>{story.status === 'active' ? '進行中' : '完了'}</dd>
        </div>
        <div>
          <dt>記録</dt>
          <dd>{recordCount}件</dd>
        </div>
      </dl>
    </header>
  );
}
