'use client';

import FacesFilter from '@/components/making/FacesFilter/FacesFilter';
import Timeline from '@/components/making/Timeline/Timeline';
import type { GoalMarker } from '@/config/site';
import { nameWithSan } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import {
  matchesSelectedAuthor,
  resolveSelectedAuthor,
  setSelectedAuthor,
  useSelectedAuthorRaw,
} from './selectedAuthor';

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
 * 選択中の書き手は URL のクエリ ?by=<id> に持ち、共有できるようにする（selectedAuthor.ts）。
 * /making/ は h1 の直下にタイムラインを置くので、記録タイトルは h2 にする。
 */
export default function MakingTimeline({ records, people, goal, latestId }: MakingTimelineProps) {
  const selected = resolveSelectedAuthor(
    people.map((person) => person.id),
    useSelectedAuthorRaw(),
  );
  const selectedPerson = people.find((person) => person.id === selected);
  const visible = records.filter((record) => matchesSelectedAuthor(record.author, selected));

  return (
    <>
      <FacesFilter people={people} selected={selected} onSelect={setSelectedAuthor} />
      <Timeline
        records={visible}
        people={people}
        order="asc"
        goal={goal}
        latestId={latestId}
        headingLevel="h2"
        emptyText={
          selectedPerson
            ? `${nameWithSan(selectedPerson)}の記録はまだありません。書いたものから順に、ここに並びます。`
            : 'まだ記録はありません。書いたものから順に、ここに並びます。'
        }
      />
    </>
  );
}
