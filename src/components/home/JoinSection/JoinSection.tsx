import Button from '@/components/common/Button/Button';
import Section from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import { site } from '@/config/site';
import styles from './JoinSection.module.css';

/** トップ「関わる・見守る」（仕様書 5.1）。当面は Instagram の DM とメールを案内する */
export default function JoinSection() {
  return (
    <Section id="join" alt aria-labelledby="join-title">
      <SectionTitle id="join-title">関わる・見守る</SectionTitle>
      <p className={styles.text}>
        日々の様子はInstagramで。意見を言いたい、手伝いたい、出店や出演に興味がある。どんな形でも、まずは
        Instagram の DM かメールで声をかけてください。
      </p>
      <div className={styles.actions}>
        <Button href={site.instagram} external>
          Instagramを見る
        </Button>
        <a className={styles.email} href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </div>
    </Section>
  );
}
