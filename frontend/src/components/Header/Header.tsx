'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { ThemeToggle } from '../ThemeToggle';
import { api } from '@/lib/api';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    api.logout();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <Link href="/courses" className={styles.logo}>
        Coursera
      </Link>
      <div className={styles.headerRight}>
        <ThemeToggle />
        <button onClick={handleLogout} className={styles.logoutButton}>
          Log out
        </button>
      </div>
    </header>
  );
}
