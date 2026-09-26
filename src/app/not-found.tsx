import type { Metadata } from 'next';
import Button from '@/components/common/Button/Button';
import Section, { SectionMore } from '@/components/common/Section/Section';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';

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
      <p>
        このページは移動したか、まだ作られていません。祭りと一緒にサイトも育てているので、あとで増えるかもしれません。
      </p>
      <SectionMore>
        <Button href="/" variant="secondary">
          トップへ戻る
        </Button>
      </SectionMore>
    </Section>
  );
}
