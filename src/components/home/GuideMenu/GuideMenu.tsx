import Link from 'next/link';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import type { GuideMenuItem } from '@/config/site';
import styles from './GuideMenu.module.css';

interface GuideMenuProps {
  items: GuideMenuItem[];
}

/** 案内メニューカード（仕様書 6.3）。準備中でもクリックでき、準備中ページへ飛ぶ */
export default function GuideMenu({ items }: GuideMenuProps) {
  return (
    <ul className={styles.cardGrid}>
      {items.map((item) => (
        <li key={item.key} className={styles.card}>
          <Link href={item.href} className={styles.cardBody}>
            <div className={styles.cardMeta}>
              <StatusBadge status={item.status} />
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardSummary}>{item.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
