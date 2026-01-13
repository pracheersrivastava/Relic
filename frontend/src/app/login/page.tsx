'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Input, Button, ThemeToggle } from '@/components';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [fullname, setFullname] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        const result = await register(fullname, email, password);
        if (result.success) {
          setSuccess('Registration successful! Please login.');
          setIsRegister(false);
          setFullname('');
          setPassword('');
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          router.push('/');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginCard}>
      <div className={styles.loginHeader}>
        <Link href="/" className={styles.logo}>Coursera</Link>
        <h1 className={styles.title}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className={styles.subtitle}>
          {isRegister 
            ? 'Join millions of learners around the world' 
            : 'Log in to continue your learning journey'}
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
        
        {error && (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles.success}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {success}
          </div>
        )}
        
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? (
            <>
              <span className={styles.buttonSpinner} />
              Please wait...
            </>
          ) : (
            isRegister ? 'Create Account' : 'Log In'
          )}
        </Button>
      </form>
      
      <div className={styles.switchAuth}>
        <button 
          type="button" 
          onClick={() => { 
            const newMode = !isRegister;
            setIsRegister(newMode); 
            setError('');
            setSuccess('');
            window.history.replaceState(null, '', newMode ? '/login?register=true' : '/login');
          }}
          className={styles.switchButton}
        >
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up for free"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>
        <ThemeToggle />
      </div>
      
      <Suspense fallback={
        <div className={styles.loginCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
      
      <div className={styles.footer}>
        <p>By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
      </div>
    </div>
  );
}
