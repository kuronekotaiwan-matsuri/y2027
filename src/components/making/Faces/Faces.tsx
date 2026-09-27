import Link from 'next/link';
import Avatar from '@/components/making/Avatar/Avatar';
import { getShortName } from '@/lib/content/select';
import type { PersonSummary } from '@/lib/content/types';
import styles from './Faces.module.css';

interface FacesProps {
  /** order 順に並べ替え済みの書き手 */
  people: PersonSummary[];
  /** リストの aria-label（例: 「書いている人たち」） */
  label: string;
}

/**
 * 顔の並び（リンク版）。トップの「書いている人たち」で使う（仕様書 5.1）。
 * /making/ の「顔で絞る」（ボタン版）は FacesFilter。見た目は同じ CSS を共有する。
 * 顔の下の名前は短い名前（shortName、無ければ name）。列の幅を揃えるため
 */
export default function Faces({ people, label }: FacesProps) {
  if (people.length === 0) return null;
  return (
    <ul className={styles.faces} aria-label={label}>
      {people.map((person) => (
        <li key={person.id}>
          <Link className={styles.face} href={`/making/people/${person.id}/`}>
            <Avatar person={person} size="md" />
            <span className={styles.faceName}>{getShortName(person)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
