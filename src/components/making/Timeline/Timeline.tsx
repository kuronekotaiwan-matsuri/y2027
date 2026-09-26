import { Fragment } from 'react';
import EmptyNote from '@/components/common/EmptyNote/EmptyNote';
import TimelineItem from '@/components/making/TimelineItem/TimelineItem';
import type { GoalMarker } from '@/config/site';
import { groupByMonth, sortRecordsByDate, type SortOrder } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './Timeline.module.css';

interface TimelineProps {
  records: RecordSummary[];
  /** records の書き手（署名に使う）。author が見つからない記録は描画しない */
  people: PersonSummary[];
  /** 上が古い（asc）か、新しい順（desc）か。/making/ と書き手ページは asc、準備中ページは desc */
  order?: SortOrder;
  /** 最下部のゴールマーカー（/making/ のみ） */
  goal?: GoalMarker;
  /** 記録が無いときの文 */
  emptyText?: string;
  /** 最後（最新）の項目に付ける id。「最新の記録へ」のジャンプ先 */
  latestId?: string;
}

/** タイムライン。/making/、書き手ページ、準備中ページの関連記録で共用（仕様書 6.3） */
export default function Timeline({
  records,
  people,
  order = 'asc',
  goal,
  emptyText = 'まだ記録はありません。書いたものから順に、ここに並びます。',
  latestId,
}: TimelineProps) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
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
            const person = peopleById.get(record.author);
            if (!person) return null;
            return (
              <TimelineItem
                key={record.slug}
                record={record}
                person={person}
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
