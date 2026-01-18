'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './WelcomeWidget.module.css';
import { useAuth } from '@/context/AuthContext';
import { api, Course } from '@/lib/api';

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
                    // Get last watched course from localStorage or just use first enrolled
                    const lastWatchedId = localStorage.getItem('lastWatchedCourse');
                    const targetCourse = lastWatchedId
                        ? response.data.find(c => c._id === lastWatchedId) || response.data[0]
                        : response.data[0];

                    // Calculate progress for this course
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

    // Don't show widget if not authenticated or loading
    if (!isAuthenticated || isLoading) {
        return null;
    }

    // Don't show if no enrolled courses
    if (!lastCourse) {
        return null;
    }

    const firstName = user?.fullname?.split(' ')[0] || 'Learner';

    return (
        <section className={styles.welcomeWidget}>
            <div className={styles.welcomeContent}>
                <h2 className={styles.welcomeTitle}>Welcome, {firstName}</h2>

                <div className={styles.courseCard}>
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
                        {lastCourse.subtitle && (
                            <p className={styles.courseSubtitle}>{lastCourse.subtitle}</p>
                        )}
                        <Link
                            href={`/course/${lastCourse._id}`}
                            className={styles.resumeButton}
                            onClick={() => localStorage.setItem('lastWatchedCourse', lastCourse._id)}
                        >
                            Resume Learning
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
