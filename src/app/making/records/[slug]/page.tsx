import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section/Section';
import RecordArticle from '@/components/making/RecordArticle/RecordArticle';
import {
  adjacentRecords,
  adjacentRecordsInStory,
  getRecord,
  getRecords,
  getStory,
} from '@/lib/content';
import { recordJsonLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/metadata';
import { slugParamsOrPlaceholder, type SlugParam as Params } from '@/lib/staticParams';

/** 静的エクスポートのため、generateStaticParams に無いパスは 404 */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return slugParamsOrPlaceholder(getRecords().map((record) => record.slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const record = getRecord(slug);
  const story = record ? getStory(record.storySlug) : undefined;
  if (!record || !story) return {};
  return buildMetadata({
    title: `${record.title} | ${story.title}`,
    description: record.summary,
    path: `/making/records/${record.slug}/`,
    type: 'article',
    image: record.thumbnail,
  });
}

/** 記録ページ（仕様書 5.4） */
export default async function RecordPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const record = getRecord(slug);
  if (!record) notFound();
  const story = getStory(record.storySlug);
  if (!story) notFound();

  const records = getRecords();

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recordJsonLd(record, story)) }}
      />
      <RecordArticle
        record={record}
        story={story}
        adjacentInStory={adjacentRecordsInStory(records, slug)}
        adjacentOverall={adjacentRecords(records, slug)}
      />
    </Section>
  );
}
