'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { ThemeToggle } from '../ThemeToggle';
import { ChangePasswordModal } from '../ChangePasswordModal';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleJoin = () => {
    router.push('/login?register=true');
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            Coursera
          </Link>
          <Link href="/" className={styles.navLinkAnchor}>
            Explore
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/courses" className={styles.navLinkAnchor}>
                My Learning
              </Link>
              <Link href="/quiz" className={styles.navLinkAnchor}>
                Quiz Results
              </Link>
            </>
          )}
        </div>

        <div className={styles.centerSection}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

          {isAuthenticated ? (
            <>
              {/* Cart Icon */}
              <Link href="/cart" className={styles.cartButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount}</span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className={styles.userSection} ref={dropdownRef}>
                <button
                  className={styles.userButton}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className={styles.avatar}>
                    {getInitials(user?.fullname || 'U')}
                  </div>
                  <svg
                    className={`${styles.chevron} ${showDropdown ? styles.chevronUp : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.avatarLarge}>
                        {getInitials(user?.fullname || 'U')}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.fullname}</span>
                        <span className={styles.userEmail}>{user?.email}</span>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/cart" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className={`${styles.dropdownItem} ${styles.adminItem}`} onClick={() => setShowDropdown(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        setShowPasswordModal(true);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Change Password
                    </button>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </nav>
  );
};

export default Navbar;
