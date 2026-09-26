import Button from '@/components/common/Button/Button';
import Section, { SectionLead, SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import RecordCard from '@/components/making/RecordCard/RecordCard';
import StoryCard from '@/components/making/StoryCard/StoryCard';
import type { Phase } from '@/config/site';
import type { RecordSummary, StorySummary } from '@/lib/content/types';
import styles from './LatestMaking.module.css';

interface LatestMakingProps {
  phase: Phase;
  /** 最新の記録（新しい順。通常3件） */
  records: RecordSummary[];
  /** 進行中の物語（order 順） */
  stories: StorySummary[];
  /** 物語 slug → 記録数 */
  counts: Map<string, number>;
}

/** トップ「できるまで」（仕様書 5.1） */
export default function LatestMaking({ phase, records, stories, counts }: LatestMakingProps) {
  const storyMap = new Map(stories.map((story) => [story.slug, story]));
  const sub = phase === 'archive' ? '開催の記録と振り返り' : 'いちばん新しい3件';

  return (
    <Section id="making" alt aria-labelledby="making-title">
      <SectionTitle id="making-title" sub={sub}>
        黒猫台湾まつりができるまで
      </SectionTitle>
      <SectionLead>
        2026年の秋から、5月の祭りまで。決まったことも、決まっていないことも、順番に残していきます。
      </SectionLead>

      {records.length > 0 ? (
        <div className={styles.cardGrid}>
          {records.map((record) => {
            const story = storyMap.get(record.storySlug);
            return story ? <RecordCard key={record.slug} record={record} story={story} /> : null;
          })}
        </div>
      ) : (
        <p className={styles.empty}>まだ記録はありません。</p>
      )}

      <h3 className={styles.storiesTitle}>
        物語 <small>いま進んでいるもの</small>
      </h3>
      <div className={styles.cardGrid2}>
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} recordCount={counts.get(story.slug) ?? 0} />
        ))}
      </div>

      <SectionMore>
        <Button href="/making/" variant="secondary">
          すべて見る
        </Button>
      </SectionMore>
    </Section>
  );
}
