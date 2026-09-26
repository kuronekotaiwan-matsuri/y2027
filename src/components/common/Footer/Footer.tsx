import Link from 'next/link';
import { Fragment } from 'react';
import { site } from '@/config/site';
import styles from './Footer.module.css';

interface FooterProps {
  /** 最終更新日（YYYY-MM-DD）。最新の記録の日付 */
  lastUpdated?: string;
}

/** サイトフッター（仕様書 6.2） */
export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterInner}>
        <p className={styles.siteFooterLogo}>{site.name}</p>
        <nav className={styles.siteFooterNav} aria-label="フッターナビゲーション">
          <Link href="/">トップ</Link>
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              {item.preparing && <span className={styles.navPreparing}>（準備中）</span>}
            </Link>
          ))}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href={`mailto:${site.email}`}>メール</a>
        </nav>
        <p className={styles.siteFooterMeta}>
          メール: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p className={styles.siteFooterMeta}>
          過去のサイト:{' '}
          {site.pastSites.map((past, index) => (
            <Fragment key={past.year}>
              {index > 0 && ' ／ '}
              <a href={past.url} target="_blank" rel="noopener noreferrer">
                {past.year}
              </a>
            </Fragment>
          ))}
        </p>
        <p className={styles.siteFooterMeta}>
          {lastUpdated && (
            <>
              最終更新日: <time dateTime={lastUpdated}>{lastUpdated}</time> ／{' '}
            </>
          )}
          <span className={styles.copyright}>© {site.event.year} {site.organizer}</span>
        </p>
      </div>
    </footer>
  );
}
