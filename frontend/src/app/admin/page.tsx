'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Navbar } from '@/components';
import { api, DashboardStats } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (end === 0) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
};

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AdminDashboard() {
    const router = useRouter();
    const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animated counters
    const animatedUsers = useAnimatedCounter(stats?.totalUsers || 0);
    const animatedCourses = useAnimatedCounter(stats?.totalCourses || 0);
    const animatedOrders = useAnimatedCounter(stats?.totalOrders || 0);
    const animatedQuizAttempts = useAnimatedCounter(stats?.totalQuizAtempts || 0);
    const animatedRevenue = useAnimatedCounter(stats?.totalRevenue || 0);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        const response = await api.getDashboardStats();

        if (response.success && response.data) {
            setStats(response.data);
        } else {
            setError(response.message || 'Failed to load dashboard');
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        // Redirect non-authenticated users
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Redirect non-admin users
        if (!isAdmin) {
            router.push('/');
            return;
        }

        fetchStats();
    }, [isAuthenticated, isAdmin, authLoading, router, fetchStats]);

    // Show loading while checking auth
    if (authLoading || (!isAuthenticated && !error)) {
        return (
            <div className={styles.dashboardPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Checking access...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Access denied for non-admins
    if (!isAdmin && isAuthenticated) {
        return (
            <div className={styles.dashboardPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>🔒</div>
                        <h2>Access Denied</h2>
                        <p>You don&apos;t have permission to access this page.</p>
                        <button className={styles.backButton} onClick={() => router.push('/')}>
                            Go Home
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.dashboardPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Loading dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboardPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>❌</div>
                        <p>{error}</p>
                        <button className={styles.retryButton} onClick={fetchStats}>
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.dashboardPage}>
            <Navbar />
            <main className={styles.main}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            <span className={styles.titleIcon}>📊</span>
                            Admin Dashboard
                        </h1>
                        <p className={styles.subtitle}>
                            Real-time platform analytics and insights
                        </p>
                    </div>
                    <div className={styles.headerBadge}>
                        <span className={styles.adminBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Admin Access
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {/* Users Card */}
                    <div className={`${styles.statCard} ${styles.usersCard}`}>
                        <div className={styles.statIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{animatedUsers.toLocaleString()}</span>
                            <span className={styles.statLabel}>Total Users</span>
                        </div>
                        <div className={styles.statGlow} />
                    </div>

                    {/* Courses Card */}
                    <div className={`${styles.statCard} ${styles.coursesCard}`}>
                        <div className={styles.statIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                <line x1="12" y1="6" x2="16" y2="6" />
                                <line x1="12" y1="10" x2="16" y2="10" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{animatedCourses.toLocaleString()}</span>
                            <span className={styles.statLabel}>Total Courses</span>
                        </div>
                        <div className={styles.statGlow} />
                    </div>

                    {/* Orders Card */}
                    <div className={`${styles.statCard} ${styles.ordersCard}`}>
                        <div className={styles.statIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7" />
                                <path d="M15 20l5.447-2.724A1 1 0 0 0 21 16.382V5.618a1 1 0 0 0-1.447-.894L15 7" />
                                <path d="M9 7v13" />
                                <path d="M15 7v13" />
                                <circle cx="12" cy="4" r="2" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{animatedOrders.toLocaleString()}</span>
                            <span className={styles.statLabel}>Total Orders</span>
                        </div>
                        <div className={styles.statGlow} />
                    </div>

                    {/* Quiz Attempts Card */}
                    <div className={`${styles.statCard} ${styles.quizCard}`}>
                        <div className={styles.statIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{animatedQuizAttempts.toLocaleString()}</span>
                            <span className={styles.statLabel}>Quiz Attempts</span>
                        </div>
                        <div className={styles.statGlow} />
                    </div>

                    {/* Revenue Card - Full Width */}
                    <div className={`${styles.statCard} ${styles.revenueCard}`}>
                        <div className={styles.statIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{formatCurrency(animatedRevenue)}</span>
                            <span className={styles.statLabel}>Total Revenue</span>
                        </div>
                        <div className={styles.revenueChart}>
                            <div className={styles.chartBar} style={{ height: '40%' }} />
                            <div className={styles.chartBar} style={{ height: '65%' }} />
                            <div className={styles.chartBar} style={{ height: '45%' }} />
                            <div className={styles.chartBar} style={{ height: '80%' }} />
                            <div className={styles.chartBar} style={{ height: '55%' }} />
                            <div className={styles.chartBar} style={{ height: '90%' }} />
                            <div className={styles.chartBar} style={{ height: '75%' }} />
                        </div>
                        <div className={styles.statGlow} />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.actionsGrid}>
                        <button className={styles.actionButton} onClick={fetchStats}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Refresh Stats
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
