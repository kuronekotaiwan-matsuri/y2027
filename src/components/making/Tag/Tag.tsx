import { getTagStatus } from '@/config/site';
import styles from './Tag.module.css';

/** 状態タグ（仕様書 3.4）。推奨語彙は data-status で見た目を分ける */
export default function Tag({ label }: { label: string }) {
  return (
    <span className={styles.tag} data-status={getTagStatus(label) ?? 'other'}>
      {label}
    </span>
  );
}
