import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Notice from '@/components/common/Notice/Notice';
import Section from '@/components/common/Section/Section';
import Prose from '@/components/making/Prose/Prose';
import StoryCard from '@/components/making/StoryCard/StoryCard';
import StoryHeader from '@/components/making/StoryHeader/StoryHeader';
import Timeline from '@/components/making/Timeline/Timeline';
import {
  countRecordsByStory,
  getContent,
  getStory,
  getStories,
  recordsByStory,
} from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';
import { slugParamsOrPlaceholder, type SlugParam as Params } from '@/lib/staticParams';
import styles from './page.module.css';

/** 静的エクスポートのため、generateStaticParams に無いパスは 404 */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return slugParamsOrPlaceholder(getStories().map((story) => story.slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return buildMetadata({
    title: story.title,
    description: story.subtitle ?? `${story.owner}による物語「${story.title}」の記録。`,
    path: `/making/stories/${story.slug}/`,
    image: story.cover,
  });
}

/** 物語ページ（仕様書 5.5） */
export default async function StoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const { stories, records } = getContent();
  const storyRecords = recordsByStory(records, slug, 'asc');
  const counts = countRecordsByStory(records);
  const others = stories.filter((other) => other.slug !== slug);

  return (
    <>
      <Section>
        <div className={styles.storyPage}>
          {story.kind === 'personal' && <Notice owner={story.owner} />}
          <StoryHeader story={story} recordCount={storyRecords.length} />
          <Prose html={story.bodyHtml} />
        </div>
      </Section>

      <Section alt aria-labelledby="story-records-title">
        <h2 id="story-records-title" className={styles.recordsTitle}>
          この物語の記録
        </h2>
        <Timeline
          records={storyRecords}
          stories={[story]}
          order="asc"
          emptyText="この物語の記録はまだありません。"
        />
      </Section>

      {others.length > 0 && (
        <Section aria-labelledby="other-stories-title">
          <h2 id="other-stories-title" className={styles.recordsTitle}>
            他の物語
          </h2>
          <div className={styles.cardGrid2}>
            {others.map((other) => (
              <StoryCard key={other.slug} story={other} recordCount={counts.get(other.slug) ?? 0} />
            ))}
          </div>
        </Section>
      )}

      <Section>
        <p className={styles.back}>
          <Link href="/making/">← できるまでへ戻る</Link>
        </p>
      </Section>
    </>
  );
}
