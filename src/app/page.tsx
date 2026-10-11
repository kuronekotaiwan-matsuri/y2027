import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import AboutBrief from '@/components/home/AboutBrief/AboutBrief';
import GuideSection from '@/components/home/GuideSection/GuideSection';
import Hero from '@/components/home/Hero/Hero';
import JoinSection from '@/components/home/JoinSection/JoinSection';
import LatestMaking from '@/components/home/LatestMaking/LatestMaking';
import { site } from '@/config/site';
import { getContent, latestRecords, toPersonSummary, toRecordSummary } from '@/lib/content';
import { festivalJsonLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/metadata';
import { getHomeSectionOrder, type HomeSectionKey } from '@/lib/phase';

export const metadata: Metadata = buildMetadata({ path: '/' });

/** トップ（仕様書 5.1）。並び順とヒーローの内容は phase で決まる */
export default function HomePage() {
  const { people, records } = getContent();
  const { phase } = site;

  const latest = latestRecords(records, 3).map(toRecordSummary);
  const peopleSummaries = people.map(toPersonSummary);
  // 開催日が確定している間だけ Festival を出す（仕様書 9.5）
  const festival = festivalJsonLd();

  const sections: Record<HomeSectionKey, ReactNode> = {
    hero: <Hero phase={phase} latest={latest[0]} />,
    making: <LatestMaking phase={phase} records={latest} people={peopleSummaries} />,
    guide: <GuideSection phase={phase} />,
    about: <AboutBrief />,
    join: <JoinSection />,
  };

  return (
    <>
      {festival && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(festival) }}
        />
      )}
      {getHomeSectionOrder(phase).map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}
    </>
  );
}
