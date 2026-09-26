import styles from './Prose.module.css';

interface ProseProps {
  /** markdownToHtml の出力 */
  html: string;
  className?: string;
}

/**
 * Markdown 本文の描画。
 * 本文中の figure は class="figure" / "figure__frame"（グローバル）で出るため、
 * 見た目は `.prose :global(.figure)` で当てる。
 */
export default function Prose({ html, className }: ProseProps) {
  return (
    <div
      className={[styles.prose, className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
