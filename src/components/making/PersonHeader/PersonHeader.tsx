import InstagramIcon from '@/components/common/InstagramIcon/InstagramIcon';
import Avatar from '@/components/making/Avatar/Avatar';
import { getRoleLabel } from '@/config/site';
import type { PersonSummary } from '@/lib/content/types';
import styles from './PersonHeader.module.css';

interface PersonHeaderProps {
  person: PersonSummary;
  /** h1 に付ける id（Section の aria-labelledby 用） */
  titleId?: string;
}

/** 書き手ページのヘッダー（仕様書 5.5）: 顔（大）、名前、立場、自己紹介、Instagram */
export default function PersonHeader({ person, titleId }: PersonHeaderProps) {
  return (
    <header className={styles.personHeader}>
      <Avatar person={person} size="lg" lazy={false} />
      <div className={styles.personHeaderHead}>
        <h1 id={titleId} className={styles.personHeaderName}>
          {person.name}
        </h1>
        {person.kind !== 'group' && (
          <p className={styles.personHeaderRole}>{getRoleLabel(person.role)}</p>
        )}
      </div>
      {person.bio && <p className={styles.personHeaderBio}>{person.bio}</p>}
      {person.instagram && (
        <p className={styles.personHeaderInsta}>
          <a href={person.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramIcon size={16} />
            Instagram を見る
          </a>
        </p>
      )}
    </header>
  );
}
