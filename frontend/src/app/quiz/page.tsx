'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Navbar } from '@/components';
import { api, Quiz } from '@/lib/api';

// Default quiz ID - replace with actual quiz from database
const DEFAULT_QUIZ_ID = '6792eb27478a5c62620b5a5f';

export default function QuizListPage() {
    const [loading, setLoading] = useState(true);
    const [quizAvailable, setQuizAvailable] = useState(false);

    useEffect(() => {
        // Check if default quiz exists
        const checkQuiz = async () => {
            const response = await api.getQuiz(DEFAULT_QUIZ_ID);
            setQuizAvailable(response.success);
            setLoading(false);
        };
        checkQuiz();
    }, []);

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>📝</div>
                        <h1 className={styles.heroTitle}>CDL Practice Tests</h1>
                        <p className={styles.heroSubtitle}>
                            Prepare for your CDL exam with our interactive practice tests.
                            Get instant feedback and detailed explanations.
                        </p>
                    </div>

                    {/* Quiz Cards */}
                    <div className={styles.quizGrid}>
                        {/* Main Quiz Card */}
                        <div className={styles.quizCard}>
                            <div className={styles.cardBadge}>
                                <span className={styles.badgeIcon}>🎯</span>
                                Featured
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardIcon}>🚛</div>
                                <h2 className={styles.cardTitle}>CDL General Knowledge</h2>
                                <p className={styles.cardDescription}>
                                    Test your knowledge on trucking regulations, safety, and commercial driving fundamentals.
                                </p>
                                <div className={styles.cardMeta}>
                                    <span className={styles.metaItem}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                        20 Questions
                                    </span>
                                    <span className={styles.metaItem}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <path d="M22 4 12 14.01l-3-3" />
                                        </svg>
                                        70% to pass
                                    </span>
                                </div>
                            </div>
                            {loading ? (
                                <div className={styles.cardButtonLoading}>
                                    <div className={styles.spinner} />
                                    Loading...
                                </div>
                            ) : quizAvailable ? (
                                <Link href={`/quiz/${DEFAULT_QUIZ_ID}`} className={styles.cardButton}>
                                    Start Quiz
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ) : (
                                <div className={styles.cardButtonDisabled}>
                                    Quiz Unavailable
                                </div>
                            )}
                        </div>

                        {/* Coming Soon Cards */}
                        <div className={`${styles.quizCard} ${styles.comingSoon}`}>
                            <div className={styles.cardContent}>
                                <div className={styles.cardIcon}>🛞</div>
                                <h2 className={styles.cardTitle}>Air Brakes Endorsement</h2>
                                <p className={styles.cardDescription}>
                                    Master air brake systems and safety procedures.
                                </p>
                            </div>
                            <div className={styles.comingSoonBadge}>Coming Soon</div>
                        </div>

                        <div className={`${styles.quizCard} ${styles.comingSoon}`}>
                            <div className={styles.cardContent}>
                                <div className={styles.cardIcon}>⚠️</div>
                                <h2 className={styles.cardTitle}>Hazmat Endorsement</h2>
                                <p className={styles.cardDescription}>
                                    Learn hazardous materials handling and safety.
                                </p>
                            </div>
                            <div className={styles.comingSoonBadge}>Coming Soon</div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        <h3 className={styles.infoTitle}>How it works</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>1</div>
                                <h4>Start Quiz</h4>
                                <p>Click on a quiz to begin your practice test</p>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>2</div>
                                <h4>Answer Questions</h4>
                                <p>Select your answers and get instant feedback</p>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>3</div>
                                <h4>Learn from Mistakes</h4>
                                <p>Read explanations to understand correct answers</p>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>4</div>
                                <h4>Track Progress</h4>
                                <p>View your score and retry to improve</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
