'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './WelcomeWidget.module.css';
import { useAuth } from '@/context/AuthContext';
import { api, Course } from '@/lib/api';

// Default quiz ID - update this with your actual quiz ID
const DEFAULT_QUIZ_ID = '6792eb27478a5c62620b5a5f';

interface CourseWithProgress extends Course {
    progress: number;
}

export function WelcomeWidget() {
    const { user, isAuthenticated } = useAuth();
    const [lastCourse, setLastCourse] = useState<CourseWithProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLastCourse = async () => {
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.getEnrolledCourses();
                if (response.success && response.data && response.data.length > 0) {
                    const lastWatchedId = localStorage.getItem('lastWatchedCourse');
                    const targetCourse = lastWatchedId
                        ? response.data.find(c => c._id === lastWatchedId) || response.data[0]
                        : response.data[0];

                    let totalLessons = 0;
                    let completedLessons = 0;

                    try {
                        const sectionsResponse = await api.getCourseSections(targetCourse._id);
                        if (sectionsResponse.success && sectionsResponse.data) {
                            await Promise.all(
                                sectionsResponse.data.map(async (section) => {
                                    try {
                                        const lessonsResponse = await api.getSectionLessons(section._id);
                                        if (lessonsResponse.success && lessonsResponse.data) {
                                            totalLessons += lessonsResponse.data.length;
                                        }
                                        const completedResponse = await api.getCompletedLessons(section._id);
                                        if (completedResponse.success && completedResponse.data) {
                                            completedLessons += completedResponse.data.length;
                                        }
                                    } catch {
                                        // Silent fail
                                    }
                                })
                            );
                        }
                    } catch {
                        // Silent fail
                    }

                    const progress = totalLessons > 0
                        ? Math.round((completedLessons / totalLessons) * 100)
                        : 0;

                    setLastCourse({
                        ...targetCourse,
                        progress,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLastCourse();
    }, [isAuthenticated]);

    const firstName = user?.fullname?.split(' ')[0] || 'Learner';

    // Always show the widget (for practice test), but loading state only for authenticated
    if (isLoading && isAuthenticated) {
        return null;
    }

    return (
        <section className={styles.welcomeWidget}>
            <div className={styles.widgetContainer}>
                {/* Title for logged-in users */}
                {isAuthenticated && (
                    <h2 className={styles.welcomeTitle}>Welcome back, {firstName} 👋</h2>
                )}

                {/* Guest Title */}
                {!isAuthenticated && (
                    <h2 className={styles.guestTitle}>Test Your Knowledge</h2>
                )}

                <div className={styles.cardsRow}>
                    {/* Course Progress Card (logged in only) */}
                    {isAuthenticated && lastCourse && (
                        <div className={styles.courseCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardLabel}>Continue Learning</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.progressCircle}>
                                    <svg viewBox="0 0 100 100" className={styles.progressRing}>
                                        <circle
                                            className={styles.progressBg}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            className={styles.progressFill}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            strokeWidth="8"
                                            strokeDasharray={`${lastCourse.progress * 2.51} 251`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <span className={styles.progressText}>{lastCourse.progress}%</span>
                                </div>
                                <div className={styles.courseInfo}>
                                    <h3 className={styles.courseTitle}>{lastCourse.title}</h3>
                                    <Link
                                        href={`/course/${lastCourse._id}`}
                                        className={styles.resumeButton}
                                        onClick={() => localStorage.setItem('lastWatchedCourse', lastCourse._id)}
                                    >
                                        Resume Learning →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Practice Test Card (always visible) */}
                    <div className={`${styles.practiceCard} ${!isAuthenticated ? styles.practiceCardFull : ''}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardLabelAlt}>Practice Test</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.practiceIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                            </div>
                            <div className={styles.practiceInfo}>
                                <h3 className={styles.practiceTitle}>CDL Practice Test</h3>
                                <p className={styles.practiceDesc}>20 questions • 70% to pass</p>
                                <Link href={`/quiz/${DEFAULT_QUIZ_ID}`} className={styles.startQuizButton}>
                                    Start Quiz
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
