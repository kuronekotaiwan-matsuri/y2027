import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import AboutBrief from '@/components/home/AboutBrief/AboutBrief';
import GuideSection from '@/components/home/GuideSection/GuideSection';
import Hero from '@/components/home/Hero/Hero';
import JoinSection from '@/components/home/JoinSection/JoinSection';
import LatestMaking from '@/components/home/LatestMaking/LatestMaking';
import { site } from '@/config/site';
import { countRecordsByStory, getContent, latestRecords } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';
import { getHomeSectionOrder, type HomeSectionKey } from '@/lib/phase';

export const metadata: Metadata = buildMetadata({ path: '/' });

/** トップ（仕様書 5.1）。並び順とヒーローの内容は phase で決まる */
export default function HomePage() {
  const { stories, records } = getContent();
  const { phase } = site;

  const latest = latestRecords(records, 3);
  const latestRecord = latest[0];
  const latestStory = latestRecord
    ? stories.find((story) => story.slug === latestRecord.storySlug)
    : undefined;
  const counts = countRecordsByStory(records);

  const sections: Record<HomeSectionKey, ReactNode> = {
    hero: (
      <Hero
        phase={phase}
        latest={
          latestRecord && latestStory ? { record: latestRecord, story: latestStory } : undefined
        }
      />
    ),
    making: <LatestMaking phase={phase} records={latest} stories={stories} counts={counts} />,
    guide: <GuideSection phase={phase} />,
    about: <AboutBrief />,
    join: <JoinSection />,
  };

  return (
    <>
      {getHomeSectionOrder(phase).map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}
    </>
  );
}
