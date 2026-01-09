'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { ThemeToggle } from '../ThemeToggle';

export const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleJoin = () => {
    router.push('/login?register=true');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.leftSection}>
          <a href="/" className={styles.logo}>
            Coursera
          </a>
          <button className={styles.navLink}>
            Explore
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </button>
          <button className={styles.navLink}>Degrees</button>
        </div>

        <div className={styles.centerSection}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="What do you want to learn?"
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.rightSection}>
          <ThemeToggle />
          <button 
            className={styles.loginButton}
            onClick={handleLogin}
          >
            Log In
          </button>
          <button 
            className={styles.joinButton}
            onClick={handleJoin}
          >
            Join for Free
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
