import CatMark from '@/components/common/CatMark/CatMark';
import type { PersonSummary } from '@/lib/content/types';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: styles.avatarSm,
  md: styles.avatarMd,
  lg: styles.avatarLg,
};

/** 顔の丸の class。「すべて」のような、書き手ではない丸にも使う（FacesFilter） */
export function avatarClass(size: AvatarSize, ...extra: (string | undefined)[]): string {
  return [styles.avatar, SIZE_CLASS[size], ...extra].filter(Boolean).join(' ');
}

interface AvatarProps {
  person: Pick<PersonSummary, 'name' | 'kind' | 'avatar' | 'avatarBackground'>;
  size?: AvatarSize;
  /** ファーストビューに置くときは false（遅延読み込みしない） */
  lazy?: boolean;
  className?: string;
}

/**
 * 顔（仕様書 6.3）。画像（avatar）があれば個人も組織もそれ。
 * 無ければ、個人は名前の1文字目、組織は黒猫のマーク。
 * 装飾扱い（aria-hidden）にし、名前は隣にテキストで出す（仕様書 9.6）。
 */
export default function Avatar({ person, size = 'sm', lazy = true, className }: AvatarProps) {
  if (person.avatar) {
    // 地の色は data-bg で切り替える（Avatar.module.css）。無指定は cream
    return (
      <span
        className={avatarClass(size, styles.avatarPhoto, className)}
        data-bg={person.avatarBackground}
        aria-hidden="true"
      >
        <img
          src={person.avatar}
          alt=""
          loading={lazy ? 'lazy' : undefined}
          decoding="async"
        />
      </span>
    );
  }
  if (person.kind === 'group') {
    return (
      <span className={avatarClass(size, styles.avatarGroup, className)} aria-hidden="true">
        <CatMark />
      </span>
    );
  }
  const initial = Array.from(person.name)[0] ?? '';
  return (
    <span className={avatarClass(size, className)} aria-hidden="true">
      {initial}
    </span>
  );
}
