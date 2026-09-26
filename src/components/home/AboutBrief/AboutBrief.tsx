import Button from '@/components/common/Button/Button';
import Section, { SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import styles from './AboutBrief.module.css';

/** トップ「黒猫台湾まつりとは（要約）」（仕様書 5.1） */
export default function AboutBrief() {
  return (
    <Section id="about" aria-labelledby="about-title">
      <SectionTitle id="about-title">黒猫台湾まつりとは</SectionTitle>
      <p className={styles.text}>
        神奈川県川崎市高津区・二子新地の大山街道沿いで開かれてきた、地域発の台湾カルチャーフェスティバルです。
        台湾のフードや雑貨、ワークショップ、ステージを、商店街の通りを歩きながら楽しみます。
        2026年に第4回を開催し、2027年は第5回になります。
      </p>
      <SectionMore>
        <Button href="/about/" variant="secondary">
          くわしく見る
        </Button>
      </SectionMore>
    </Section>
  );
}
