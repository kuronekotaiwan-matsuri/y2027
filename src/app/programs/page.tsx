import type { Metadata } from 'next';
import PreparingPage from '@/components/preparing/PreparingPage/PreparingPage';
import { site } from '@/config/site';
import { getContent, recordsByTopic, toPersonSummary, toRecordSummary } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'プログラム',
  description: `黒猫台湾まつり2027のプログラム。${site.preparing.programs.text}`,
  path: '/programs/',
});

/** プログラム（準備中。仕様書 5.2） */
export default function ProgramsPage() {
  const { people, records } = getContent();
  return (
    <PreparingPage
      status={site.preparing.programs}
      topic="programs"
      records={recordsByTopic(records, 'programs').map(toRecordSummary)}
      people={people.map(toPersonSummary)}
    />
  );
}
