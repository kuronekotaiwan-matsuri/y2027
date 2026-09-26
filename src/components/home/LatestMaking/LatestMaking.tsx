import Button from '@/components/common/Button/Button';
import EmptyNote from '@/components/common/EmptyNote/EmptyNote';
import Section, { SectionLead, SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import Faces from '@/components/making/Faces/Faces';
import RecordCard from '@/components/making/RecordCard/RecordCard';
import type { Phase } from '@/config/site';
import type { PersonSummary, RecordSummary } from '@/lib/content/types';
import styles from './LatestMaking.module.css';

interface LatestMakingProps {
  phase: Phase;
  /** 最新の記録（新しい順。通常3件） */
  records: RecordSummary[];
  /** 書き手（order 順。「書いている人たち」と署名に使う） */
  people: PersonSummary[];
}

/** トップ「できるまで」（仕様書 5.1）: 最新3件、書いている人たち、すべて見る */
export default function LatestMaking({ phase, records, people }: LatestMakingProps) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const sub = phase === 'archive' ? '開催の記録と振り返り' : 'いちばん新しい3件';

  return (
    <Section id="making" alt aria-labelledby="making-title">
      <SectionTitle id="making-title" sub={sub}>
        黒猫台湾まつりができるまで
      </SectionTitle>
      <SectionLead>
        2026年の秋から、5月の祭りまで。決まったことも、決まっていないことも、順番に残していきます。
      </SectionLead>

      {records.length > 0 ? (
        <div className={styles.cardGrid}>
          {records.map((record) => {
            const person = peopleById.get(record.author);
            return person ? <RecordCard key={record.slug} record={record} person={person} /> : null;
          })}
        </div>
      ) : (
        <EmptyNote>
          まだ記録はありません。動き出したら、決まったことも決まっていないことも、ここに順番に載せていきます。
        </EmptyNote>
      )}

      {people.length > 0 && (
        <div className={styles.writers}>
          <h3 className={styles.writersTitle}>
            書いている人たち <small>顔を押すと、その人の記録だけ読めます</small>
          </h3>
          <Faces people={people} label="書いている人たち" />
        </div>
      )}

      <SectionMore>
        <Button href="/making/" variant="secondary">
          すべて見る
        </Button>
      </SectionMore>
    </Section>
  );
}
