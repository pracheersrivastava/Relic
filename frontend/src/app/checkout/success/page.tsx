'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { refreshCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const confirmPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setMessage('Invalid session');
                return;
            }

            try {
                // Call backend to confirm payment and create enrollments
                const response = await fetch('/api/checkout/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });

                if (response.ok) {
                    setStatus('success');
                    setMessage('Payment successful! You are now enrolled in your courses.');

                    // Refresh cart to clear items
                    await refreshCart();

                    // Redirect to courses after 3 seconds
                    setTimeout(() => {
                        router.push('/courses');
                    }, 3000);
                } else {
                    const data = await response.json();
                    setStatus('error');
                    setMessage(data.error || 'Failed to confirm payment');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred while confirming your payment');
            }
        };

        confirmPayment();
    }, [sessionId, router, refreshCart]);

    return (
        <div className={styles.container}>
            {status === 'loading' && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <h2>{message}</h2>
                </div>
            )}

            {status === 'success' && (
                <div className={styles.success}>
                    <div className={styles.checkmark}>✓</div>
                    <h1>Thank You!</h1>
                    <p>{message}</p>
                    <p className={styles.redirect}>Redirecting to your courses...</p>
                </div>
            )}

            {status === 'error' && (
                <div className={styles.error}>
                    <div className={styles.errorIcon}>✕</div>
                    <h1>Payment Error</h1>
                    <p>{message}</p>
                    <button
                        onClick={() => router.push('/cart')}
                        className={styles.button}
                    >
                        Return to Cart
                    </button>
                </div>
            )}
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <Suspense fallback={
                    <div className={styles.container}>
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <h2>Loading...</h2>
                        </div>
                    </div>
                }>
                    <SuccessContent />
                </Suspense>
            </main>
        </div>
    );
}
