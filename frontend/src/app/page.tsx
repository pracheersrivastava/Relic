'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Input, Button, ThemeToggle } from '@/components';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [fullname, setFullname] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await api.register(fullname, email, password);
        if (response.success) {
          setIsRegister(false);
          setError('');
          alert('Registration successful! Please login.');
        } else {
          setError(response.message || 'Registration failed');
        }
      } else {
        const response = await api.login(email, password);
        if (response.success) {
          router.push('/courses');
        } else {
          setError(response.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.logo}>Coursera</h1>
          <p className={styles.subtitle}>
            {isRegister ? 'Create an account' : 'Log in to continue learning'}
          </p>
        </div>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {isRegister && (
            <Input
              id="fullname"
              label="Full name"
              type="text"
              placeholder="Enter your full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          )}
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
          {error && <div className={styles.error}>{error}</div>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Log in')}
          </Button>
        </form>
        <div className={styles.switchAuth}>
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className={styles.switchButton}
          >
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
