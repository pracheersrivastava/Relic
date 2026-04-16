'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { ThemeToggle } from '../ThemeToggle';
import { ChangePasswordModal } from '../ChangePasswordModal';
import { api } from '@/lib/api';

import { useAuth } from '@/context/AuthContext';

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/courses" className={styles.logo}>
          Relic
        </Link>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <button onClick={() => setShowPasswordModal(true)} className={styles.settingsButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Log out
          </button>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
