import Link from 'next/link';
import Avatar from '@/components/making/Avatar/Avatar';
import { getRoleLabel } from '@/config/site';
import type { PersonSummary } from '@/lib/content/types';
import styles from './PeopleList.module.css';

interface PeopleListProps {
  /** order 順に並べ替え済みの書き手 */
  people: PersonSummary[];
}

/** 書き手の一覧（仕様書 5.6「作っている人たち」）。顔・名前・立場・自己紹介。各行は書き手ページへ */
export default function PeopleList({ people }: PeopleListProps) {
  return (
    <ul className={styles.people}>
      {people.map((person) => (
        <li key={person.id}>
          <Link className={styles.personRow} href={`/making/people/${person.id}/`}>
            <Avatar person={person} size="md" />
            <div className={styles.personRowHead}>
              <span className={styles.personRowName}>{person.name}</span>
              {person.kind !== 'group' && (
                <span className={styles.personRowRole}>{getRoleLabel(person.role)}</span>
              )}
            </div>
            {person.bio && <p className={styles.personRowBio}>{person.bio}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
