import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  /** 外部リンク（新しいタブで開く） */
  external?: boolean;
  children: ReactNode;
  className?: string;
}

/** CTA とリンク用のボタン（見た目はリンク、実体は a） */
export default function Button({
  href,
  variant = 'primary',
  external = false,
  children,
  className,
}: ButtonProps) {
  const classes = [
    styles.btn,
    variant === 'primary' ? styles.btnPrimary : styles.btnSecondary,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (external) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
