import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

interface SectionTitleProps {
  children: ReactNode;
  /** 見出しの脇に置く補足（例: 「いちばん新しい3件」） */
  sub?: ReactNode;
  as?: 'h1' | 'h2';
  id?: string;
  /**
   * 固定文言の長い見出し用。children に置いた `<wbr />` の位置でだけ折り返す（語の途中で折れないように）。
   * 例: `黒猫台湾まつりが<wbr />できるまで`
   */
  keepAll?: boolean;
}

/** セクション見出し（統一書式） */
export default function SectionTitle({
  children,
  sub,
  as: Tag = 'h2',
  id,
  keepAll = false,
}: SectionTitleProps) {
  const textClass = [styles.sectionTitleText, keepAll ? styles.sectionTitleTextKeepAll : '']
    .filter(Boolean)
    .join(' ');
  return (
    <Tag id={id} className={styles.sectionTitle}>
      <span className={textClass}>{children}</span>
      {sub !== undefined && <span className={styles.sectionTitleSub}>{sub}</span>}
    </Tag>
  );
}
