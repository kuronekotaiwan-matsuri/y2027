import { Fragment } from 'react';
import EmptyNote from '@/components/common/EmptyNote/EmptyNote';
import TimelineItem from '@/components/making/TimelineItem/TimelineItem';
import type { GoalMarker } from '@/config/site';
import { groupByMonth, sortRecordsByDate, type SortOrder } from '@/lib/content/select';
import type { RecordSummary, StorySummary } from '@/lib/content/types';
import styles from './Timeline.module.css';

interface TimelineProps {
  records: RecordSummary[];
  /** records が属する物語（バッジの色と名前に使う） */
  stories: StorySummary[];
  /** 上が古い（asc）か、新しい順（desc）か。/making/ と物語ページは asc、準備中ページは desc */
  order?: SortOrder;
  /** 最下部のゴールマーカー（/making/ のみ） */
  goal?: GoalMarker;
  /** 記録が無いときの文 */
  emptyText?: string;
  /** 最後（最新）の項目に付ける id。「最新の記録へ」のジャンプ先 */
  latestId?: string;
}

/** タイムライン。/making/、物語ページ、準備中ページの関連記録で共用（仕様書 6.3） */
export default function Timeline({
  records,
  stories,
  order = 'asc',
  goal,
  emptyText = 'まだ記録はありません。書いたものから順に、ここに並びます。',
  latestId,
}: TimelineProps) {
  const storyMap = new Map(stories.map((story) => [story.slug, story]));
  const sorted = sortRecordsByDate(records, order);
  const groups = groupByMonth(sorted);
  const latestSlug = order === 'asc' ? sorted[sorted.length - 1]?.slug : sorted[0]?.slug;

  return (
    <div
      className={[styles.timeline, sorted.length === 0 ? styles.timelineIsEmpty : '']
        .filter(Boolean)
        .join(' ')}
    >
      {sorted.length === 0 && (
        <div className={styles.timelineEmpty}>
          <EmptyNote>{emptyText}</EmptyNote>
        </div>
      )}
      {groups.map((group) => (
        <Fragment key={group.month}>
          <div className={styles.timelineMonth}>{group.label}</div>
          {group.records.map((record) => {
            const story = storyMap.get(record.storySlug);
            if (!story) return null;
            return (
              <TimelineItem
                key={record.slug}
                record={record}
                story={story}
                id={latestId && record.slug === latestSlug ? latestId : undefined}
              />
            );
          })}
        </Fragment>
      ))}
      {goal && (
        <div className={styles.timelineGoal}>
          {goal.label}
          {goal.note && <small>{goal.note}</small>}
        </div>
      )}
    </div>
  );
}
