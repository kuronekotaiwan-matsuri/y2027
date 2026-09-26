'use client';

import { useCallback, useSyncExternalStore, type CSSProperties } from 'react';
import Timeline from '@/components/making/Timeline/Timeline';
import type { GoalMarker } from '@/config/site';
import type { RecordSummary, StorySummary } from '@/lib/content/types';
import styles from './MakingTimeline.module.css';

const ALL = 'all';
const QUERY_KEY = 'story';
const CHANGE_EVENT = 'making:story-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function readSelectedFromUrl(): string {
  return new URLSearchParams(window.location.search).get(QUERY_KEY) ?? ALL;
}

function readSelectedOnServer(): string {
  return ALL;
}

interface MakingTimelineProps {
  /** 全件（本文なし）。絞り込みはクライアント側で行う（仕様書 9.2） */
  records: RecordSummary[];
  stories: StorySummary[];
  goal?: GoalMarker;
  latestId?: string;
}

/**
 * 物語フィルタ付きタイムライン（/making/）。
 * 選択中の物語は URL のクエリ ?story=<slug> に持ち、共有できるようにする（仕様書 5.3）。
 */
export default function MakingTimeline({ records, stories, goal, latestId }: MakingTimelineProps) {
  const selectedRaw = useSyncExternalStore(subscribe, readSelectedFromUrl, readSelectedOnServer);
  const selected = stories.some((story) => story.slug === selectedRaw) ? selectedRaw : ALL;

  const select = useCallback((slug: string) => {
    const url = new URL(window.location.href);
    if (slug === ALL) {
      url.searchParams.delete(QUERY_KEY);
    } else {
      url.searchParams.set(QUERY_KEY, slug);
    }
    window.history.replaceState(window.history.state, '', url.toString());
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const visible =
    selected === ALL ? records : records.filter((record) => record.storySlug === selected);

  const chipClass = (active: boolean) =>
    [styles.chip, active ? styles.chipActive : ''].filter(Boolean).join(' ');

  return (
    <>
      <div className={styles.chips} role="group" aria-label="物語で絞り込む">
        <button
          type="button"
          className={chipClass(selected === ALL)}
          aria-pressed={selected === ALL}
          onClick={() => select(ALL)}
        >
          すべて
        </button>
        {stories.map((story) => (
          <button
            key={story.slug}
            type="button"
            className={chipClass(selected === story.slug)}
            aria-pressed={selected === story.slug}
            style={
              { '--chip-color': story.color.bg, '--chip-text': story.color.text } as CSSProperties
            }
            onClick={() => select(story.slug)}
          >
            <span
              className={styles.chipDot}
              style={{ background: 'var(--chip-color)' }}
              aria-hidden="true"
            />
            {story.title}
            {story.kind === 'personal' && '（個人）'}
          </button>
        ))}
      </div>
      <Timeline
        records={visible}
        stories={stories}
        order="asc"
        goal={goal}
        latestId={latestId}
        emptyText={
          selected === ALL
            ? 'まだ記録はありません。書いたものから順に、ここに並びます。'
            : 'この物語の記録はまだありません。'
        }
      />
    </>
  );
}
