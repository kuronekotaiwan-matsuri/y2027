import { Fragment } from 'react';
import styles from './RecordTitle.module.css';

interface RecordTitleProps {
  /** MakingRecord.titleSegments（front-matter の title を `|` で分けたもの） */
  segments: string[];
}

/**
 * 記録のタイトル文字列。見出し（h1〜h3）やリンクの中に置く。
 * 日本語は文字ごとに折り返せて語の途中で折れやすいので、句読点の後と `|` の位置でだけ折り返す。
 * それでも幅に収まらない長い語は、幅のところで折る。
 */
export default function RecordTitle({ segments }: RecordTitleProps) {
  return (
    <span className={styles.recordTitle}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {segment}
        </Fragment>
      ))}
    </span>
  );
}
