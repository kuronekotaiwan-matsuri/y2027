import type { Metadata } from 'next';
import Button from '@/components/common/Button/Button';
import Section, { SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Section aria-labelledby="not-found-title">
      <SectionTitle as="h1" id="not-found-title">
        ページが見つかりません
      </SectionTitle>
      <p className={styles.text}>
        お探しのページは、移動したか、まだ作られていません。サイトは祭りと一緒に少しずつ育てているので、あとで載るかもしれません。
      </p>
      <SectionMore>
        <Button href="/" variant="secondary">
          トップへ戻る
        </Button>
      </SectionMore>
    </Section>
  );
}
