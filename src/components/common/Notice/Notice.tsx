import styles from './Notice.module.css';

/** 個人活動の注記（仕様書 3.8）。personal の物語ページと記録ページの冒頭に置く */
export default function Notice({ owner }: { owner: string }) {
  return (
    <p className={styles.notice} role="note">
      この物語は、{owner}
      が個人として取り組んでいる活動の記録です。黒猫台湾まつり実行委員会の公式な販売・企画ではありません。
    </p>
  );
}
