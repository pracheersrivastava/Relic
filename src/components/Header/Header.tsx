'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { ThemeToggle } from '../ThemeToggle';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/courses" className={styles.logo}>
        Coursera
      </Link>
      <div className={styles.headerRight}>
        <ThemeToggle />
      </div>
    </header>
  );
}
