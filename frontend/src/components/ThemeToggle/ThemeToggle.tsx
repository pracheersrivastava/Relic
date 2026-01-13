'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      className={styles.toggleButton}
      onClick={mounted ? toggleTheme : undefined}
      aria-label="Toggle theme"
      title="Toggle theme"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {mounted ? (theme === 'light' ? '🌙' : '☀️') : '🌙'}
      </span>
    </button>
  );
}
