'use client';

import { useCallback, useSyncExternalStore } from 'react';
import FacesFilter, { FACES_ALL } from '@/components/making/FacesFilter/FacesFilter';
import Timeline from '@/components/making/Timeline/Timeline';
import type { GoalMarker } from '@/config/site';
import { nameWithSan } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';

const QUERY_KEY = 'by';
const CHANGE_EVENT = 'making:by-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function readSelectedFromUrl(): string {
  return new URLSearchParams(window.location.search).get(QUERY_KEY) ?? FACES_ALL;
}

function readSelectedOnServer(): string {
  return FACES_ALL;
}

interface MakingTimelineProps {
  /** 全件（本文なし）。絞り込みはクライアント側で行う（仕様書 9.2） */
  records: RecordSummary[];
  /** order 順の書き手（記録 0 件の人も含む） */
  people: PersonSummary[];
  goal?: GoalMarker;
  latestId?: string;
}

/**
 * 顔で絞る付きタイムライン（/making/。仕様書 5.3）。
 * 選択中の書き手は URL のクエリ ?by=<id> に持ち、共有できるようにする。
 */
export default function MakingTimeline({ records, people, goal, latestId }: MakingTimelineProps) {
  const selectedRaw = useSyncExternalStore(subscribe, readSelectedFromUrl, readSelectedOnServer);
  const selectedPerson = people.find((person) => person.id === selectedRaw);
  const selected = selectedPerson ? selectedPerson.id : FACES_ALL;

  const select = useCallback((id: string) => {
    const url = new URL(window.location.href);
    if (id === FACES_ALL) {
      url.searchParams.delete(QUERY_KEY);
    } else {
      url.searchParams.set(QUERY_KEY, id);
    }
    window.history.replaceState(window.history.state, '', url.toString());
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const visible =
    selected === FACES_ALL ? records : records.filter((record) => record.author === selected);

  return (
    <>
      <FacesFilter people={people} selected={selected} onSelect={select} />
      <Timeline
        records={visible}
        people={people}
        order="asc"
        goal={goal}
        latestId={latestId}
        emptyText={
          selectedPerson
            ? `${nameWithSan(selectedPerson)}の記録はまだありません。書いたものから順に、ここに並びます。`
            : 'まだ記録はありません。書いたものから順に、ここに並びます。'
        }
      />
    </>
  );
}
