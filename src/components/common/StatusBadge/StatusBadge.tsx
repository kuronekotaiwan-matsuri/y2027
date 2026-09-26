import styles from './StatusBadge.module.css';

export type PageStatus = 'preparing' | 'published';

const LABELS: Record<PageStatus, string> = {
  preparing: '準備中',
  published: '公開中',
};

/** 主コンテンツの状態バッジ「準備中」「公開中」 */
export default function StatusBadge({ status }: { status: PageStatus }) {
  return (
    <span className={styles.statusBadge} data-status={status}>
      {LABELS[status]}
    </span>
  );
}
