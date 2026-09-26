import { getRoleLabel, type RoleKey } from '@/config/site';
import styles from './RoleBadge.module.css';

/** 書き手の立場バッジ（仕様書 3.3） */
export default function RoleBadge({ role }: { role: RoleKey }) {
  return (
    <span className={styles.badgeRole} data-role={role}>
      {getRoleLabel(role)}
    </span>
  );
}
