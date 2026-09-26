import Link from 'next/link';
import styles from './Crumb.module.css';

/** パンくず（仕様書 5.4、5.5）: 「できるまで」へのリンク。このページがタイムラインの1件であることを示す */
export default function Crumb() {
  return (
    <nav className={styles.crumb} aria-label="パンくず">
      <Link href="/making/">できるまで</Link>
    </nav>
  );
}
