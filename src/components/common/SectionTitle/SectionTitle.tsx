import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

interface SectionTitleProps {
  children: ReactNode;
  /** 見出しの脇に置く補足（例: 「いちばん新しい3件」） */
  sub?: ReactNode;
  as?: 'h1' | 'h2';
  id?: string;
}

/** セクション見出し（統一書式） */
export default function SectionTitle({ children, sub, as: Tag = 'h2', id }: SectionTitleProps) {
  return (
    <Tag id={id} className={styles.sectionTitle}>
      <span className={styles.sectionTitleText}>{children}</span>
      {sub !== undefined && <span className={styles.sectionTitleSub}>{sub}</span>}
    </Tag>
  );
}
