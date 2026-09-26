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
  person: Pick<PersonSummary, 'name' | 'kind' | 'avatar'>;
  size?: AvatarSize;
  /** ファーストビューに置くときは false（遅延読み込みしない） */
  lazy?: boolean;
  className?: string;
}

/**
 * 顔（仕様書 6.3）。写真があればそれ、無ければ名前の1文字目、組織は黒猫のマーク。
 * 装飾扱い（aria-hidden）にし、名前は隣にテキストで出す（仕様書 9.6）。
 */
export default function Avatar({ person, size = 'sm', lazy = true, className }: AvatarProps) {
  if (person.kind === 'group') {
    return (
      <span className={avatarClass(size, styles.avatarGroup, className)} aria-hidden="true">
        <CatMark />
      </span>
    );
  }
  if (person.avatar) {
    return (
      <span className={avatarClass(size, styles.avatarPhoto, className)} aria-hidden="true">
        <img
          src={person.avatar}
          alt=""
          loading={lazy ? 'lazy' : undefined}
          decoding="async"
        />
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
