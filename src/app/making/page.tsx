import type { Metadata } from 'next';
import Section, { SectionLead } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import LatestRecordLink from '@/components/making/MakingTimeline/LatestRecordLink';
import MakingTimeline from '@/components/making/MakingTimeline/MakingTimeline';
import { site } from '@/config/site';
import { getContent, toPersonSummary, toRecordSummary } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';
import { getGoalMarker } from '@/lib/phase';
import styles from './page.module.css';

const LATEST_ID = 'latest-record';

export const metadata: Metadata = buildMetadata({
  title: 'できるまで',
  description:
    '2026年10月から2027年5月の開催まで、黒猫台湾まつり2027ができていく過程の記録。決まったことも、決まっていないことも、順番に残していきます。',
  path: '/making/',
});

/** できるまで（仕様書 5.3）。全記録の時系列タイムライン。顔で絞り込める */
export default function MakingPage() {
  const { people, records } = getContent();
  const recordSummaries = records.map(toRecordSummary);
  const peopleSummaries = people.map(toPersonSummary);
  return (
    <Section aria-labelledby="making-title">
      <SectionTitle
        as="h1"
        id="making-title"
        sub={
          // 顔で絞った結果が 0 件のときは client 側で hidden になる
          <LatestRecordLink
            className={styles.jump}
            targetId={LATEST_ID}
            authors={recordSummaries.map((record) => record.author)}
            peopleIds={peopleSummaries.map((person) => person.id)}
          >
            最新の記録へ
          </LatestRecordLink>
        }
      >
        黒猫台湾まつりができるまで
      </SectionTitle>
      <SectionLead>
        2026年の秋から、5月の祭りまで。決まったことも、決まっていないことも、順番に残していきます。上が古く、下が新しい記録です。
      </SectionLead>
      <MakingTimeline
        records={recordSummaries}
        people={peopleSummaries}
        goal={getGoalMarker(site.event, site.phase)}
        latestId={LATEST_ID}
      />
    </Section>
  );
}
