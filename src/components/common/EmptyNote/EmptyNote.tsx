import type { ReactNode } from 'react';
import styles from './EmptyNote.module.css';

/** 空の状態（記録がない、準備中）の表示。「まだない」で終わらせず、いつ・何が載るかを書く */
export default function EmptyNote({ children }: { children: ReactNode }) {
  return <p className={styles.emptyNote}>{children}</p>;
}
