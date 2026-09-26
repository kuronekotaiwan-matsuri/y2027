import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  /** 交互に置く代替背景 */
  alt?: boolean;
  children: ReactNode;
  className?: string;
  'aria-labelledby'?: string;
}

/** ページ内の区画。内側で最大幅と左右余白をそろえる */
export default function Section({ id, alt = false, children, className, ...rest }: SectionProps) {
  const classes = [styles.section, alt ? styles.sectionAlt : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <section id={id} className={classes} aria-labelledby={rest['aria-labelledby']}>
      <div className={styles.sectionInner}>{children}</div>
    </section>
  );
}

/** セクション見出しの下に置く短いリード文 */
export function SectionLead({ children }: { children: ReactNode }) {
  return <p className={styles.sectionLead}>{children}</p>;
}

/** セクション末尾の「すべて見る」など */
export function SectionMore({ children }: { children: ReactNode }) {
  return <p className={styles.sectionMore}>{children}</p>;
}
