import Link from 'next/link';
import CatMark from '@/components/common/CatMark/CatMark';
import { site } from '@/config/site';
import HeaderNav from './HeaderNav';
import styles from './Header.module.css';

/** サイトヘッダー。ナビと開閉の状態は HeaderNav（client）が持つ */
export default function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderInner}>
        <Link className={styles.siteLogo} href="/">
          <CatMark />
          {site.name}
        </Link>
        <HeaderNav items={site.nav} instagramUrl={site.instagram} />
      </div>
    </header>
  );
}
