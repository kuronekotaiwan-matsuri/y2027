import type { EventInfoItem } from '@/config/site';
import styles from './EventInfo.module.css';

interface EventInfoProps {
  items: EventInfoItem[];
}

/** 開催情報ブロック（仕様書 6.3）。値は設定ファイルのまま出す（未定なら「未定」が入っている） */
export default function EventInfo({ items }: EventInfoProps) {
  return (
    <dl className={styles.eventInfo}>
      {items.map((item) => (
        <div key={item.key} className={styles.eventInfoItem} data-decided={item.decided}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
