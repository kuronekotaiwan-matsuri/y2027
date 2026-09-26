interface CatMarkProps {
  className?: string;
}

/**
 * 黒猫のマーク。ヘッダーのロゴと、組織の書き手の顔（Avatar）で共用する。
 * 本体は currentColor。目の色は CSS custom property `--cat-mark-eye` で決める（置く側の背景色にする）。
 */
export default function CatMark({ className }: CatMarkProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M5 3l7 6h8l7-6v12a11 11 0 0 1-22 0z" />
      <circle cx="12" cy="17" r="1.7" fill="var(--cat-mark-eye, #FBF3E4)" />
      <circle cx="20" cy="17" r="1.7" fill="var(--cat-mark-eye, #FBF3E4)" />
    </svg>
  );
}
