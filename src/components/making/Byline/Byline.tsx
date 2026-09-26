import Avatar, { type AvatarSize } from '@/components/making/Avatar/Avatar';
import { getRoleLabel } from '@/config/site';
import type { PersonSummary } from '@/lib/content/types';
import styles from './Byline.module.css';

export type BylineVariant = 'label' | 'text';

interface BylineProps {
  person: Pick<PersonSummary, 'name' | 'kind' | 'avatar' | 'role'>;
  /** label: 立場を小さな枠で（カード）。text: 「（出店者）」の文字で（記録ページ） */
  variant?: BylineVariant;
  size?: AvatarSize;
}

/**
 * 署名（仕様書 3.2、6.3）: 顔 + 名前 + 立場 を1組で。組織は立場を添えない（仕様書 3.8）。
 * リンクを含まないので、カード全体がリンクのときも入れ子にならない。
 */
export default function Byline({ person, variant = 'label', size }: BylineProps) {
  const avatarSize = size ?? (variant === 'text' ? 'md' : 'sm');
  const showRole = person.kind !== 'group';
  return (
    <span className={styles.byline}>
      <Avatar person={person} size={avatarSize} />
      <span className={styles.bylineName}>{person.name}</span>
      {showRole &&
        (variant === 'label' ? (
          <span className={styles.bylineRole}>{getRoleLabel(person.role)}</span>
        ) : (
          <span className={styles.bylineParen}>（{getRoleLabel(person.role)}）</span>
        ))}
    </span>
  );
}
