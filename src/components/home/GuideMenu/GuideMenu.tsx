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
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>
              <Link href={item.href}>{item.title}</Link>
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <p className={styles.cardSummary}>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
