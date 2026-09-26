import Section from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import EventInfo from '@/components/home/EventInfo/EventInfo';
import GuideMenu from '@/components/home/GuideMenu/GuideMenu';
import { site, type Phase } from '@/config/site';
import { getGuideSectionTitle } from '@/lib/phase';
import styles from './GuideSection.module.css';

interface GuideSectionProps {
  phase: Phase;
}

/** トップ「開催情報と案内メニュー」（仕様書 5.1） */
export default function GuideSection({ phase }: GuideSectionProps) {
  const { event } = site;
  return (
    <Section id="guide" aria-labelledby="guide-title">
      <SectionTitle id="guide-title" sub={event.scheduleLabel}>
        {getGuideSectionTitle(phase, event.year)}
      </SectionTitle>
      <div className={styles.eventInfo}>
        <EventInfo items={event.items} />
      </div>
      <GuideMenu items={site.guideMenu} />
    </Section>
  );
}
