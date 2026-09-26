import Button from '@/components/common/Button/Button';
import Section from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import Timeline from '@/components/making/Timeline/Timeline';
import { site, type PreparingStatus, type TopicKey } from '@/config/site';
import { formatDate } from '@/lib/content/select';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './PreparingPage.module.css';

interface PreparingPageProps {
  status: PreparingStatus;
  topic: TopicKey;
  /** この topic を持つ記録（新しい順に表示する） */
  records: RecordSummary[];
  /** 署名に使う書き手 */
  people: PersonSummary[];
}

/** 主コンテンツの準備中ページ（仕様書 5.2） */
export default function PreparingPage({ status, records, people }: PreparingPageProps) {
  return (
    <div className={styles.preparingPage}>
      <Section aria-labelledby="page-title">
        <SectionTitle as="h1" id="page-title" sub={<StatusBadge status="preparing" />}>
          {status.title}
        </SectionTitle>

        <section className={styles.block} aria-labelledby="status-title">
          <h2 id="status-title" className={styles.blockTitle}>
            いまの状況
          </h2>
          <p className={styles.statusText}>{status.text}</p>
          <p className={styles.updated}>
            更新日: <time dateTime={status.updated}>{formatDate(status.updated)}</time>
          </p>
        </section>

        <section className={styles.block} aria-labelledby="records-title">
          <h2 id="records-title" className={styles.blockTitle}>
            関連する記録
          </h2>
          <Timeline
            records={records}
            people={people}
            order="desc"
            emptyText="この話題の記録はまだありません。決まるまでの経緯を、書いたものから順にここに載せます。"
          />
        </section>

        <section className={styles.block} aria-labelledby="planned-title">
          <h2 id="planned-title" className={styles.blockTitle}>
            決まったらここに載ります
          </h2>
          <ul className={styles.plannedList}>
            {status.plannedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {status.referenceUrl && (
            <p className={styles.reference}>
              参考:{' '}
              <a href={status.referenceUrl} target="_blank" rel="noopener noreferrer">
                {status.referenceLabel ?? status.referenceUrl}
              </a>
            </p>
          )}
        </section>

        <section className={styles.block} aria-labelledby="contact-title">
          <h2 id="contact-title" className={styles.blockTitle}>
            Instagramと問い合わせ先
          </h2>
          <p className={styles.contactText}>
            決まったことは、このページと記録、Instagramでお知らせします。
          </p>
          <div className={styles.actions}>
            <Button href={site.instagram} external>
              Instagramを見る
            </Button>
            <a className={styles.email} href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </section>
      </Section>
    </div>
  );
}
