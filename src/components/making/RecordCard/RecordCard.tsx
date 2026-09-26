import Link from 'next/link';
import RoleBadge from '@/components/making/RoleBadge/RoleBadge';
import StoryBadge from '@/components/making/StoryBadge/StoryBadge';
import Tag from '@/components/making/Tag/Tag';
import { formatDate } from '@/lib/content/select';
import type { RecordSummary, StorySummary } from '@/lib/content/types';
import styles from './RecordCard.module.css';

interface RecordCardProps {
  record: RecordSummary;
  story: StorySummary;
}

/** 記録カード（トップの最新記録など） */
export default function RecordCard({ record, story }: RecordCardProps) {
  const href = `/making/records/${record.slug}/`;
  return (
    <article className={styles.card}>
      {record.thumbnail && (
        <div className={styles.cardThumb}>
          <img src={record.thumbnail} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <time className={styles.cardDate} dateTime={record.date}>
            {formatDate(record.date)}
          </time>
          <StoryBadge story={story} />
          <RoleBadge role={record.author.role} />
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
