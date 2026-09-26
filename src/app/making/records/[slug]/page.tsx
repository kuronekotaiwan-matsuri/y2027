import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section/Section';
import RecordArticle from '@/components/making/RecordArticle/RecordArticle';
import { adjacentRecords, getPerson, getRecord, getRecords, toPersonSummary } from '@/lib/content';
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
  if (!record) return {};
  // title は記録タイトルだけ。「| 黒猫台湾まつり2027」は共通処理が付ける（仕様書 5.4）
  return buildMetadata({
    title: record.title,
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
  const person = getPerson(record.author);
  if (!person) notFound();

  const personSummary = toPersonSummary(person);

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recordJsonLd(record, personSummary)) }}
      />
      <RecordArticle
        record={record}
        person={personSummary}
        adjacent={adjacentRecords(getRecords(), slug)}
      />
    </Section>
  );
}
