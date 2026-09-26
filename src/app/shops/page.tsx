import type { Metadata } from 'next';
import PreparingPage from '@/components/preparing/PreparingPage/PreparingPage';
import { site } from '@/config/site';
import { getContent, recordsByTopic, toPersonSummary, toRecordSummary } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: '出店情報',
  description: `黒猫台湾まつり2027の出店情報。${site.preparing.shops.text}`,
  path: '/shops/',
});

/** 出店情報（準備中。仕様書 5.2） */
export default function ShopsPage() {
  const { people, records } = getContent();
  return (
    <PreparingPage
      status={site.preparing.shops}
      topic="shops"
      records={recordsByTopic(records, 'shops').map(toRecordSummary)}
      people={people.map(toPersonSummary)}
    />
  );
}
