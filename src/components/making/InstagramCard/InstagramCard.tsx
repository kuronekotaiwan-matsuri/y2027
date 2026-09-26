import InstagramIcon from '@/components/common/InstagramIcon/InstagramIcon';
import styles from './InstagramCard.module.css';

/** Instagram 投稿へのリンクカード（仕様書 3.5。公式埋め込みは使わない） */
export default function InstagramCard({ url }: { url: string }) {
  const display = url.replace(/^https?:\/\/(www\.)?/, '');
  return (
    <a className={styles.instaCard} href={url} target="_blank" rel="noopener noreferrer">
      <span className={styles.instaCardIcon}>
        <InstagramIcon size={20} />
      </span>
      <span className={styles.instaCardText}>
        <span className={styles.instaCardLabel}>Instagramで見る</span>
        <span className={styles.instaCardUrl}>{display}</span>
      </span>
      <span className={styles.instaCardArrow} aria-hidden="true">
        →
      </span>
    </a>
  );
}
