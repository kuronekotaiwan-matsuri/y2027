import Link from 'next/link';
import { Fragment } from 'react';
import Notice from '@/components/common/Notice/Notice';
import InstagramCard from '@/components/making/InstagramCard/InstagramCard';
import Pager, { type PagerLink } from '@/components/making/Pager/Pager';
import Prose from '@/components/making/Prose/Prose';
import RoleBadge from '@/components/making/RoleBadge/RoleBadge';
import Tag from '@/components/making/Tag/Tag';
import { getTopic } from '@/config/site';
import { formatDate, type Adjacent } from '@/lib/content/select';
import type { RecordSummary, Story, StoryRecord } from '@/lib/content/types';
import styles from './RecordArticle.module.css';

interface RecordArticleProps {
  record: StoryRecord;
  story: Story;
  /** 同じ物語の中での前後 */
  adjacentInStory: Adjacent<RecordSummary>;
  /** 全体タイムラインでの前後 */
  adjacentOverall: Adjacent<RecordSummary>;
}

function toPagerLink(record?: RecordSummary): PagerLink | undefined {
  return record ? { href: `/making/records/${record.slug}/`, title: record.title } : undefined;
}

/** 記録ページの本体（仕様書 5.4） */
export default function RecordArticle({
  record,
  story,
  adjacentInStory,
  adjacentOverall,
}: RecordArticleProps) {
  const topics = record.topics.map(getTopic).filter((topic) => topic !== undefined);

  return (
    <article className={styles.article}>
      {story.kind === 'personal' && <Notice owner={story.owner} />}

      <header className={styles.articleHeader}>
        <p className={styles.articleStory}>
          物語: <Link href={`/making/stories/${story.slug}/`}>{story.title}</Link>
          {story.kind === 'personal' && '（個人）'}
        </p>
        <h1 className={styles.articleTitle}>{record.title}</h1>
        {/* 日付 ／ 書き手と立場 ／ 状態タグ。役割ごとにまとめる */}
        <div className={styles.articleMeta}>
          <time className={styles.articleDate} dateTime={record.date}>
            {formatDate(record.date)}
          </time>
          <span className={styles.articleByline}>
            {record.author.name}
            <RoleBadge role={record.author.role} />
          </span>
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

      <Pager
        label={`${story.title}の前後の記録`}
        prev={toPagerLink(adjacentInStory.prev)}
        next={toPagerLink(adjacentInStory.next)}
        prevLabel={`前の記録（${story.title}）`}
        nextLabel={`次の記録（${story.title}）`}
      />
      <Pager
        label="全体の前後の記録"
        prev={toPagerLink(adjacentOverall.prev)}
        next={toPagerLink(adjacentOverall.next)}
        prevLabel="前の記録（全体）"
        nextLabel="次の記録（全体）"
      />

      <p className={styles.articleBack}>
        <Link href="/making/">← できるまでへ戻る</Link>
      </p>
    </article>
  );
}
