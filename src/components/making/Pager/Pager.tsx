import Link from 'next/link';
import styles from './Pager.module.css';

export interface PagerLink {
  href: string;
  title: string;
}

interface PagerProps {
  /** nav の aria-label（例: 「祭りをつくる の前後の記録」） */
  label: string;
  prev?: PagerLink;
  next?: PagerLink;
  prevLabel?: string;
  nextLabel?: string;
}

/** 前後の記録（仕様書 5.4）。前後とも無ければ何も出さない */
export default function Pager({
  label,
  prev,
  next,
  prevLabel = '前の記録',
  nextLabel = '次の記録',
}: PagerProps) {
  if (!prev && !next) return null;
  return (
    <nav className={styles.pager} aria-label={label}>
      {prev ? (
        <Link href={prev.href} className={styles.pagerPrev}>
          <span className={styles.pagerLabel}>← {prevLabel}</span>
          <span className={styles.pagerTitle}>{prev.title}</span>
        </Link>
      ) : (
        <span className={styles.pagerEmpty} />
      )}
      {next ? (
        <Link href={next.href} className={styles.pagerNext}>
          <span className={styles.pagerLabel}>{nextLabel} →</span>
          <span className={styles.pagerTitle}>{next.title}</span>
        </Link>
      ) : (
        <span className={styles.pagerEmpty} />
      )}
    </nav>
  );
}
