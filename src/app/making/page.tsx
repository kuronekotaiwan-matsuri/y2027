import type { Metadata } from 'next';
import Section, { SectionLead } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
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
  return (
    <Section aria-labelledby="making-title">
      <SectionTitle
        as="h1"
        id="making-title"
        sub={
          records.length > 0 ? (
            <a className={styles.jump} href={`#${LATEST_ID}`}>
              最新の記録へ
            </a>
          ) : undefined
        }
      >
        黒猫台湾まつりができるまで
      </SectionTitle>
      <SectionLead>
        2026年の秋から、5月の祭りまで。決まったことも、決まっていないことも、順番に残していきます。上が古く、下が新しい記録です。
      </SectionLead>
      <MakingTimeline
        records={records.map(toRecordSummary)}
        people={people.map(toPersonSummary)}
        goal={getGoalMarker(site.event, site.phase)}
        latestId={LATEST_ID}
      />
    </Section>
  );
}
