import Link from 'next/link';
import { site } from '@/config/site';
import { withBasePath } from '@/lib/urls';
import HeaderNav from './HeaderNav';
import styles from './Header.module.css';

/** サイトヘッダー。ナビと開閉の状態は HeaderNav（client）が持つ */
export default function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderInner}>
        <Link className={styles.siteLogo} href="/">
          {/* favicon と同じ黒猫（素材集から切り出した画像）。名前はテキストで続くので alt は空 */}
          <img
            src={withBasePath('/images/cat-mark.png')}
            alt=""
            width={178}
            height={143}
            decoding="async"
          />
          {site.name}
        </Link>
        <HeaderNav items={site.nav} instagramUrl={site.instagram} />
      </div>
    </header>
  );
}
