import Link from 'next/link';
import { site } from '@/config/site';
import HeaderNav from './HeaderNav';
import styles from './Header.module.css';

/** サイトヘッダー。ナビと開閉の状態は HeaderNav（client）が持つ */
export default function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderInner}>
        <Link className={styles.siteLogo} href="/">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path fill="currentColor" d="M5 3l7 6h8l7-6v12a11 11 0 0 1-22 0z" />
            <circle cx="12" cy="17" r="1.7" fill="var(--color-header-bg)" />
            <circle cx="20" cy="17" r="1.7" fill="var(--color-header-bg)" />
          </svg>
          {site.name}
        </Link>
        <HeaderNav items={site.nav} instagramUrl={site.instagram} />
      </div>
    </header>
  );
}
