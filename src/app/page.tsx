'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Input, Button, ThemeToggle } from '@/components';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No actual authentication - just navigate to courses
    router.push('/courses');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.logo}>Coursera</h1>
          <p className={styles.subtitle}>Log in to continue learning</p>
        </div>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth>
            Log in
          </Button>
        </form>
        <div className={styles.disclaimer}>
          Backend authentication pending
        </div>
      </div>
    </div>
  );
}
