import Link from 'next/link';
import { Fragment } from 'react';
import AuthorCard from '@/components/making/AuthorCard/AuthorCard';
import Byline from '@/components/making/Byline/Byline';
import Crumb from '@/components/making/Crumb/Crumb';
import InstagramCard from '@/components/making/InstagramCard/InstagramCard';
import Pager, { type PagerLink } from '@/components/making/Pager/Pager';
import Prose from '@/components/making/Prose/Prose';
import Tag from '@/components/making/Tag/Tag';
import { getTopic } from '@/config/site';
import { formatDate, type Adjacent } from '@/lib/content/select';
import type { MakingRecord, PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './RecordArticle.module.css';

interface RecordArticleProps {
  record: MakingRecord;
  person: PersonSummary;
  /** 全体タイムラインでの前後 */
  adjacent: Adjacent<RecordSummary>;
}

function toPagerLink(record?: RecordSummary): PagerLink | undefined {
  return record ? { href: `/making/records/${record.slug}/`, title: record.title } : undefined;
}

/**
 * 記録ページの本体（仕様書 5.4）:
 * パンくず → タイトル → 署名・日付・状態タグ → 関連する案内 → 本文 → Instagram → 書いた人 → 前後の記録 → 戻る
 */
export default function RecordArticle({ record, person, adjacent }: RecordArticleProps) {
  const topics = record.topics.map(getTopic).filter((topic) => topic !== undefined);

  return (
    <article className={styles.article}>
      <header className={styles.articleHeader}>
        <Crumb />
        <h1 className={styles.articleTitle}>{record.title}</h1>
        {/* 署名（顔 + 「イケダ（出店者）」）／ 日付 ／ 状態タグ */}
        <div className={styles.articleMeta}>
          <span className={styles.articleByline}>
            <Byline person={person} variant="text" size="md" />
          </span>
          <time className={styles.articleDate} dateTime={record.date}>
            {formatDate(record.date)}
          </time>
          {record.tags.length > 0 && (
            <span className={styles.articleTags}>
              {record.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </span>
          )}
        </div>
        {topics.length > 0 && (
          <p className={styles.articleTopics}>
            関連する案内:{' '}
            {topics.map((topic, index) => (
              <Fragment key={topic.key}>
                {index > 0 && '、'}
                {topic.path ? <Link href={topic.path}>{topic.label}</Link> : topic.label}
              </Fragment>
            ))}
          </p>
        )}
      </header>

      <Prose html={record.bodyHtml} />

      {record.instagram.length > 0 && (
        <div className={styles.articleInstagram}>
          {record.instagram.map((url) => (
            <InstagramCard key={url} url={url} />
          ))}
        </div>
      )}

      <AuthorCard person={person} />

      <Pager label="前後の記録" prev={toPagerLink(adjacent.prev)} next={toPagerLink(adjacent.next)} />

      <p className={styles.articleBack}>
        <Link href="/making/">← できるまでへ戻る</Link>
      </p>
    </article>
  );
}
