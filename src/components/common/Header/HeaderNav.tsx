'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import InstagramIcon from '@/components/common/InstagramIcon/InstagramIcon';
import type { NavItem } from '@/config/site';
import styles from './Header.module.css';

interface HeaderNavProps {
  items: NavItem[];
  instagramUrl: string;
}

function normalize(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/** メインナビゲーションとハンバーガー（モバイル） */
export default function HeaderNav({ items, instagramUrl }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  const current = normalize(usePathname() ?? '/');

  return (
    <>
      <nav
        id="site-nav"
        className={[styles.siteNav, open ? styles.isOpen : ''].filter(Boolean).join(' ')}
        aria-label="メインナビゲーション"
      >
        {items.map((item) => {
          const target = normalize(item.href);
          const active = current === target || (target !== '/' && current.startsWith(`${target}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.isActive : undefined}
              aria-current={active ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
              {item.preparing && <span className={styles.navPreparing}>準備中</span>}
            </Link>
          );
        })}
        <a
          className={styles.siteNavInsta}
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon size={18} />
          Instagram
        </a>
      </nav>
      <button
        className={styles.siteHamburger}
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
    </>
  );
}
