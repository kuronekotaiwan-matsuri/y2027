'use client';

import Avatar, { avatarClass } from '@/components/making/Avatar/Avatar';
import styles from '@/components/making/Faces/Faces.module.css';
import type { PersonSummary } from '@/lib/content/types';

/** 「すべて」を表す選択値 */
export const FACES_ALL = 'all';

/** 説明文の id（aria-describedby 用。1ページに1つ） */
const HINT_ID = 'faces-filter-hint';

interface FacesFilterProps {
  /** order 順に並べ替え済みの書き手（記録 0 件の人も含む） */
  people: PersonSummary[];
  /** 選択中の書き手 ID。FACES_ALL なら「すべて」 */
  selected: string;
  onSelect: (id: string) => void;
}

/**
 * 顔で絞る（仕様書 5.3）。「すべて」と各書き手の顔をボタンで並べ、aria-pressed で選択状態を示す（仕様書 9.6）。
 * 状態は持たない。URL との同期は MakingTimeline が行う。
 */
export default function FacesFilter({ people, selected, onSelect }: FacesFilterProps) {
  const faceClass = (active: boolean) =>
    [styles.face, active ? styles.faceActive : ''].filter(Boolean).join(' ');
  const isAll = selected === FACES_ALL;

  return (
    <div>
      {/* 何が起きるかを一言で。トップの「書いている人たち」と同じ言葉 */}
      <p id={HINT_ID} className={styles.facesHint}>
        顔を押すと、その人の記録だけ読めます
      </p>
      <div className={styles.faces} role="group" aria-label="顔で絞る" aria-describedby={HINT_ID}>
        <button
          type="button"
          className={faceClass(isAll)}
          aria-pressed={isAll}
          onClick={() => onSelect(FACES_ALL)}
        >
          <span className={avatarClass('md', styles.faceAllMark)} aria-hidden="true">
            全部
          </span>
          <span className={styles.faceName}>すべて</span>
        </button>
        {people.map((person) => {
          const active = selected === person.id;
          return (
            <button
              key={person.id}
              type="button"
              className={faceClass(active)}
              aria-pressed={active}
              onClick={() => onSelect(person.id)}
            >
              <Avatar person={person} size="md" />
              <span className={styles.faceName}>{person.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
