'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Navbar } from '@/components';
import { api, Quiz, QuizQuestion, QuizResult, QuizAnswer, QuizAttempt } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Category icons mapping
const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
        'Logistics': '📦',
        'Safety & Hazards': '⚠️',
        'Safety': '🛡️',
        'General': '📚',
        'Regulations': '📋',
        'Signs': '🚦',
        'Operations': '⚙️',
    };
    return icons[category] || '🎯';
};

// Shuffle array utility
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

type QuizState = 'start' | 'question' | 'results';

interface ShuffledQuestion extends QuizQuestion {
    shuffledOptions: Array<{
        text: string;
        originalIndex: number;
        isCorrect?: boolean;
    }>;
}

export default function QuizPage() {
    const params = useParams();
    const quizId = params.id as string;

    // State
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [previousAttempt, setPreviousAttempt] = useState<QuizAttempt | null>(null);
    const { isAuthenticated } = useAuth();

    // Fetch quiz data
    const fetchQuiz = useCallback(async () => {
        setLoading(true);
        setError(null);

        const response = await api.getQuiz(quizId);

        if (response.success && response.data) {
            setQuiz(response.data.quiz);

            // Shuffle options for each question
            const shuffledQuestions: ShuffledQuestion[] = response.data.questions.map(q => {
                const optionsWithIndex = q.options.map((opt, idx) => ({
                    text: opt.text,
                    originalIndex: idx,
                    isCorrect: opt.isCorrect,
                }));
                return {
                    ...q,
                    shuffledOptions: shuffleArray(optionsWithIndex),
                };
            });

            setQuestions(shuffledQuestions);
        } else {
            setError(response.message || 'Failed to load quiz');
        }

        setLoading(false);
    }, [quizId]);

    useEffect(() => {
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId, fetchQuiz]);

    // Fetch previous attempt for authenticated users
    useEffect(() => {
        const fetchPreviousAttempt = async () => {
            if (isAuthenticated && quizId) {
                const response = await api.getMyQuizResult(quizId);
                if (response.success && response.data && response.data._id) {
                    setPreviousAttempt(response.data);
                }
            }
        };
        fetchPreviousAttempt();
    }, [isAuthenticated, quizId]);

    // Timer countdown effect
    useEffect(() => {
        if (quizState === 'question' && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        // Time's up - auto submit
                        clearInterval(timerRef.current!);
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [quizState]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current question
    const currentQuestion = questions[currentQuestionIndex];

    // Handle option selection
    const handleOptionSelect = (shuffledIndex: number) => {
        if (isAnswered) return;

        const option = currentQuestion.shuffledOptions[shuffledIndex];
        const originalIndex = option.originalIndex;

        setSelectedOption(shuffledIndex);
        setIsAnswered(true);

        // Check if the selected option is correct using the isCorrect flag
        const selectedOptionIsCorrect = option.isCorrect === true;

        // Store the answer with original index
        const newAnswers = new Map(answers);
        newAnswers.set(currentQuestion._id, {
            questionId: currentQuestion._id,
            selectedOptionIndex: originalIndex,
        });
        setAnswers(newAnswers);

        // Set correctness based on the actual isCorrect flag
        setIsCorrect(selectedOptionIsCorrect);
    };

    // Handle next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev: number) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(null);
        } else {
            // Submit quiz
            handleSubmitQuiz();
        }
    };

    // Submit quiz to backend
    const handleSubmitQuiz = async () => {
        setSubmitting(true);

        const answersArray = Array.from(answers.values()) as QuizAnswer[];
        const response = await api.submitQuiz(quizId, answersArray);

        if (response.success && response.data) {
            setResult(response.data);
            setQuizState('results');
        } else {
            setError(response.message || 'Failed to submit quiz');
        }

        setSubmitting(false);
    };

    // Start quiz
    const handleStartQuiz = () => {
        setQuizState('question');
        setCurrentQuestionIndex(0);
        setAnswers(new Map());
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(null);
        setResult(null);
        // Initialize timer (timeLimit is in minutes, convert to seconds)
        setTimeRemaining((quiz?.timeLimit || 30) * 60);
    };

    // Retry quiz
    const handleRetryQuiz = () => {
        fetchQuiz().then(() => {
            setQuizState('start');
        });
    };

    // Calculate progress
    const progress = questions.length > 0
        ? ((currentQuestionIndex + 1) / questions.length) * 100
        : 0;

    // Find correct option index for display
    const getCorrectShuffledIndex = (): number => {
        // Find the option with isCorrect: true
        return currentQuestion.shuffledOptions.findIndex((opt) => opt.isCorrect === true);
    };

    // Render loading state
    if (loading) {
        return (
            <div className={styles.quizPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Loading quiz...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Render error state
    if (error && quizState !== 'results') {
        return (
            <div className={styles.quizPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>❌</div>
                        <p>{error}</p>
                        <button className={styles.retryButton} onClick={fetchQuiz}>
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Render start screen
    if (quizState === 'start' && quiz) {
        return (
            <div className={styles.quizPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.startScreen}>
                        <div className={styles.quizIcon}>📝</div>
                        <h1 className={styles.quizTitle}>{quiz.title}</h1>

                        <div className={styles.categoryBadge}>
                            <span className={styles.categoryIcon}>{getCategoryIcon(quiz.category)}</span>
                            {quiz.category}
                        </div>

                        <div className={styles.quizMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaValue}>{questions.length}</span>
                                <span className={styles.metaLabel}>Questions</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaValue}>{quiz.passingScore}%</span>
                                <span className={styles.metaLabel}>To Pass</span>
                            </div>
                            {quiz.timeLimit && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{quiz.timeLimit}</span>
                                    <span className={styles.metaLabel}>Minutes</span>
                                </div>
                            )}
                        </div>

                        <button className={styles.startButton} onClick={handleStartQuiz}>
                            {previousAttempt ? 'Retake Quiz' : 'Start Quiz'}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Previous Attempt Result */}
                        {previousAttempt && (
                            <div className={styles.previousAttempt}>
                                <div className={styles.previousAttemptHeader}>
                                    <span className={styles.previousAttemptIcon}>📊</span>
                                    <span>Your Previous Result</span>
                                </div>
                                <div className={styles.previousAttemptStats}>
                                    <div className={`${styles.previousScore} ${previousAttempt.passed ? styles.passed : styles.failed}`}>
                                        {previousAttempt.percentage}%
                                    </div>
                                    <div className={styles.previousStatus}>
                                        {previousAttempt.passed ? (
                                            <span className={styles.passedBadge}>✓ Passed</span>
                                        ) : (
                                            <span className={styles.failedBadge}>✗ Failed</span>
                                        )}
                                    </div>
                                    <div className={styles.previousDate}>
                                        Taken on {new Date(previousAttempt.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // Render question view
    if (quizState === 'question' && currentQuestion) {
        const correctShuffledIdx = getCorrectShuffledIndex();

        return (
            <div className={styles.quizPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.questionView} key={currentQuestionIndex}>
                        {/* Progress */}
                        <div className={styles.progressHeader}>
                            <span className={styles.progressText}>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span className={`${styles.timer} ${timeRemaining < 300 ? styles.timerWarning : ''} ${timeRemaining < 60 ? styles.timerDanger : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                {formatTime(timeRemaining)}
                            </span>
                            <span className={styles.categoryBadge}>
                                <span className={styles.categoryIcon}>
                                    {getCategoryIcon(currentQuestion.category || 'General')}
                                </span>
                                {currentQuestion.category || 'General'}
                            </span>
                        </div>

                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Question Card */}
                        <div className={styles.questionCard}>
                            <p className={styles.questionText}>{currentQuestion.question}</p>

                            {/* Options */}
                            <div className={styles.optionsList}>
                                {currentQuestion.shuffledOptions.map((option: { text: string; originalIndex: number }, idx: number) => {
                                    let optionClass = styles.optionButton;

                                    if (isAnswered) {
                                        if (idx === correctShuffledIdx) {
                                            optionClass += ` ${styles.correct}`;
                                        } else if (idx === selectedOption && !isCorrect) {
                                            optionClass += ` ${styles.wrong}`;
                                        }
                                    } else if (idx === selectedOption) {
                                        optionClass += ` ${styles.selected}`;
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            className={optionClass}
                                            onClick={() => handleOptionSelect(idx)}
                                            disabled={isAnswered}
                                        >
                                            <span className={styles.optionRadio} />
                                            <span className={styles.optionText}>{option.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {isAnswered && currentQuestion.explanation && (
                                <div className={`${styles.explanationBox} ${isCorrect ? styles.correct : styles.wrong}`}>
                                    <div className={styles.explanationTitle}>
                                        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                    </div>
                                    <p className={styles.explanationText}>{currentQuestion.explanation}</p>
                                </div>
                            )}

                            {/* Next Button */}
                            {isAnswered && (
                                <button
                                    className={styles.nextButton}
                                    onClick={handleNextQuestion}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className={styles.spinner} style={{ width: 20, height: 20 }} />
                                            Submitting...
                                        </>
                                    ) : currentQuestionIndex < questions.length - 1 ? (
                                        <>
                                            Next Question
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            Finish Quiz
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <path d="M22 4 12 14.01l-3-3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Render results view
    if (quizState === 'results' && result) {
        const circumference = 2 * Math.PI * 70; // radius = 70
        const strokeDashoffset = circumference - (result.score / 100) * circumference;

        return (
            <div className={styles.quizPage}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.resultsView}>
                        <div className={styles.resultsCard}>
                            {/* Result Icon */}
                            <div className={`${styles.resultIcon} ${result.passed ? styles.passed : styles.failed}`}>
                                {result.passed ? '🎉' : '📚'}
                            </div>

                            {/* Status */}
                            <h2 className={`${styles.resultStatus} ${result.passed ? styles.passed : styles.failed}`}>
                                {result.passed ? 'Congratulations! You Passed!' : 'Not Quite There Yet'}
                            </h2>

                            {/* Score Circle */}
                            <div className={styles.scoreCircle}>
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle
                                        className={styles.scoreCircleBg}
                                        cx="80"
                                        cy="80"
                                        r="70"
                                    />
                                    <circle
                                        className={`${styles.scoreCircleProgress} ${result.passed ? styles.passed : styles.failed}`}
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                    />
                                </svg>
                                <div className={styles.scoreText}>
                                    <span className={styles.scorePercentage}>{result.score}%</span>
                                    <span className={styles.scoreLabel}>Score</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className={styles.scoreBreakdown}>
                                <div className={styles.breakdownItem}>
                                    <span className={`${styles.breakdownValue} ${styles.correct}`}>
                                        {result.correct}
                                    </span>
                                    <span className={styles.breakdownLabel}>Correct</span>
                                </div>
                                <div className={styles.breakdownItem}>
                                    <span className={`${styles.breakdownValue} ${styles.wrong}`}>
                                        {result.total - result.correct}
                                    </span>
                                    <span className={styles.breakdownLabel}>Incorrect</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.resultActions}>
                                <button className={styles.retryQuizButton} onClick={handleRetryQuiz}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 4v6h-6M1 20v-6h6" />
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                    </svg>
                                    Retry Quiz
                                </button>
                                <Link href="/" className={styles.backButton}>
                                    Back to Homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Fallback
    return null;
}
