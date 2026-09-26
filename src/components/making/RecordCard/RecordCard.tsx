import Link from 'next/link';
import Byline from '@/components/making/Byline/Byline';
import Tag from '@/components/making/Tag/Tag';
import { formatDate } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './RecordCard.module.css';

interface RecordCardProps {
  record: RecordSummary;
  person: PersonSummary;
}

/** 記録カード（トップの最新記録など。仕様書 6.3）。署名（左）と日付（右）を先頭に */
export default function RecordCard({ record, person }: RecordCardProps) {
  const href = `/making/records/${record.slug}/`;
  return (
    <article className={styles.card}>
      {record.thumbnail && (
        <div className={styles.cardThumb}>
          <img src={record.thumbnail} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={`${styles.cardMeta} ${styles.cardMetaSplit}`}>
          <Byline person={person} variant="label" size="sm" />
          <time className={styles.cardDate} dateTime={record.date}>
            {formatDate(record.date)}
          </time>
        </div>
        <h3 className={styles.cardTitle}>
          <Link href={href}>{record.title}</Link>
        </h3>
        <p className={styles.cardSummary}>{record.summary}</p>
        {record.tags.length > 0 && (
          <div className={styles.cardTags}>
            {record.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
