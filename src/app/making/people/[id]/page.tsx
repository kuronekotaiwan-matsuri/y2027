import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import Crumb from '@/components/making/Crumb/Crumb';
import PersonHeader from '@/components/making/PersonHeader/PersonHeader';
import Prose from '@/components/making/Prose/Prose';
import Timeline from '@/components/making/Timeline/Timeline';
import {
  getPeople,
  getPerson,
  getRecords,
  nameWithSan,
  recordsByAuthor,
  toPersonSummary,
  toRecordSummary,
} from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';
import { idParamsOrPlaceholder, type IdParam as Params } from '@/lib/staticParams';
import styles from './page.module.css';

/** 静的エクスポートのため、generateStaticParams に無いパスは 404 */
export const dynamicParams = false;

/** draft でない書き手は、記録が 0 件でもページを作る（仕様書 5.5） */
export function generateStaticParams(): Params[] {
  return idParamsOrPlaceholder(getPeople().map((person) => person.id));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) return {};
  return buildMetadata({
    title: person.name,
    description: person.bio ?? `${person.name}が書いた、黒猫台湾まつり2027ができるまでの記録。`,
    path: `/making/people/${person.id}/`,
    image: person.avatar,
  });
}

/** 書き手ページ（仕様書 5.5） */
export default async function PersonPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();

  const summary = toPersonSummary(person);
  const personRecords = recordsByAuthor(getRecords(), id, 'asc').map(toRecordSummary);
  const hasBody = person.bodyHtml.trim().length > 0;

  return (
    <>
      <Section aria-labelledby="person-name">
        <div className={styles.personPage}>
          <Crumb />
          <PersonHeader person={summary} titleId="person-name" />
          {hasBody && <Prose html={person.bodyHtml} />}
        </div>
      </Section>

      <Section alt aria-labelledby="person-records-title">
        <SectionTitle id="person-records-title">{nameWithSan(person)}の記録</SectionTitle>
        <Timeline
          records={personRecords}
          people={[summary]}
          order="asc"
          emptyText="まだ記録はありません。書いたものから順に、ここに並びます。"
        />
      </Section>

      <Section className={styles.backSection}>
        <p className={styles.back}>
          <Link href="/making/">← できるまでへ戻る</Link>
        </p>
      </Section>
    </>
  );
}
