import Link from 'next/link';
import Byline from '@/components/making/Byline/Byline';
import Tag from '@/components/making/Tag/Tag';
import { formatDate } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './TimelineItem.module.css';

/** 記録タイトルの見出しレベル。ページ側の見出し階層に合わせて選ぶ */
export type TimelineHeadingLevel = 'h2' | 'h3';

interface TimelineItemProps {
  record: RecordSummary;
  person: PersonSummary;
  /** 「最新の記録へ」のジャンプ先にするときの id */
  id?: string;
  /**
   * 記録タイトルの見出しレベル。既定は h3（h2 のセクション見出しの下に並ぶとき）。
   * /making/ のように h1 の直下に並ぶときは h2 にして、見出しレベルを飛ばさない
   */
  headingLevel?: TimelineHeadingLevel;
}

/**
 * タイムラインの1項目（仕様書 5.3）。先頭の行に署名（左）と日付（右）、タイトル、要約、状態タグ、サムネイル。
 * カード全体が記録ページへのリンク。
 */
export default function TimelineItem({
  record,
  person,
  id,
  headingLevel = 'h3',
}: TimelineItemProps) {
  const Heading = headingLevel;
  const cardClass = [styles.timelineCard, record.thumbnail ? styles.timelineCardThumb : '']
    .filter(Boolean)
    .join(' ');
  return (
    <article className={styles.timelineItem} id={id}>
      <Link className={cardClass} href={`/making/records/${record.slug}/`}>
        <div>
          <div className={`${styles.timelineMeta} ${styles.timelineMetaSplit}`}>
            <Byline person={person} variant="label" size="sm" />
            <time className={styles.timelineDate} dateTime={record.date}>
              {formatDate(record.date, 'short')}
            </time>
          </div>
          <Heading className={styles.timelineTitle}>{record.title}</Heading>
          <p className={styles.timelineSummary}>{record.summary}</p>
          {record.tags.length > 0 && (
            <div className={styles.timelineTags}>
              {record.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>
        {record.thumbnail && (
          <div className={styles.timelineThumb}>
            <img src={record.thumbnail} alt="" loading="lazy" decoding="async" />
          </div>
        )}
      </Link>
    </article>
  );
}
