import Link from 'next/link';
import Avatar from '@/components/making/Avatar/Avatar';
import { getRoleLabel } from '@/config/site';
import { nameWithSan } from '@/lib/content/select';
import type { PersonSummary } from '@/lib/content/types';
import styles from './AuthorCard.module.css';

const LABEL_ID = 'author-card-label';

/** 書いた人カード（仕様書 5.4）。記録ページの末尾に置く */
export default function AuthorCard({ person }: { person: PersonSummary }) {
  return (
    <aside className={styles.authorCard} aria-labelledby={LABEL_ID}>
      <p id={LABEL_ID} className={styles.authorCardLabel}>
        書いた人
      </p>
      <Avatar person={person} size="lg" />
      <div className={styles.authorCardBody}>
        <span className={styles.authorCardName}>{person.name}</span>
        {person.kind !== 'group' && (
          <span className={styles.authorCardRole}>{getRoleLabel(person.role)}</span>
        )}
        {person.bio && <p className={styles.authorCardBio}>{person.bio}</p>}
        <Link className={styles.authorCardLink} href={`/making/people/${person.id}/`}>
          {nameWithSan(person)}の記録をすべて見る →
        </Link>
      </div>
    </aside>
  );
}
