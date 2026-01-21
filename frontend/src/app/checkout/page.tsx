'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import styles from './page.module.css';

// Initialize Stripe - replace with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message || 'Payment failed');
            setIsProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Confirm payment on backend
            const confirmResult = await api.confirmPayment(paymentIntent.id);
            if (confirmResult.success) {
                onSuccess();
            } else {
                setError(confirmResult.message);
            }
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
            <PaymentElement className={styles.paymentElement} />

            {error && (
                <div className={styles.errorMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className={styles.payButton}
                disabled={!stripe || isProcessing}
            >
                {isProcessing ? (
                    <>
                        <span className={styles.spinner} />
                        Processing...
                    </>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Pay Now
                    </>
                )}
            </button>

            <div className={styles.securityNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure payment powered by Stripe
            </div>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { cart, cartCount, isLoading: cartLoading, refreshCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        const initializePayment = async () => {
            if (!isAuthenticated || cartCount === 0) return;

            const response = await api.createPaymentIntent();
            if (response.success && response.data.clientSecret) {
                setClientSecret(response.data.clientSecret);
            } else {
                setError(response.message);
            }
        };

        if (!authLoading && !cartLoading) {
            initializePayment();
        }
    }, [isAuthenticated, cartCount, authLoading, cartLoading]);

    const handlePaymentSuccess = async () => {
        setPaymentSuccess(true);
        await refreshCart();
        setTimeout(() => {
            router.push('/courses');
        }, 3000);
    };

    // Loading state
    if (authLoading || cartLoading) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Loading checkout...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔐</div>
                        <h2>Please Log In</h2>
                        <p>You need to be logged in to checkout</p>
                        <Link href="/login" className={styles.primaryButton}>
                            Log In
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Empty cart
    if (!cart || cartCount === 0) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Add courses to your cart before checkout</p>
                        <Link href="/" className={styles.primaryButton}>
                            Browse Courses
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Payment success
    if (paymentSuccess) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2>Payment Successful!</h2>
                        <p>Thank you for your purchase. You now have access to your courses.</p>
                        <p className={styles.redirect}>Redirecting to your courses...</p>
                    </div>
                </main>
            </div>
        );
    }

    const totalAmount = cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.courseId?.price || item.price || 0), 0);

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/cart" className={styles.backLink}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back to Cart
                        </Link>
                        <h1 className={styles.title}>Checkout</h1>
                    </div>

                    <div className={styles.content}>
                        {/* Order Summary */}
                        <div className={styles.orderSummary}>
                            <h3 className={styles.sectionTitle}>Order Summary</h3>

                            <div className={styles.courseList}>
                                {cart.items.map((item) => (
                                    <div key={item.courseId._id} className={styles.courseItem}>
                                        <div className={styles.courseBadge}>C</div>
                                        <div className={styles.courseDetails}>
                                            <h4>{item.courseId.title}</h4>
                                            {item.courseId.subtitle && <p>{item.courseId.subtitle}</p>}
                                        </div>
                                        <span className={styles.coursePrice}>
                                            ${(item.courseId.price || item.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>Total</span>
                                <span className={styles.totalAmount}>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className={styles.paymentSection}>
                            <h3 className={styles.sectionTitle}>Payment Details</h3>

                            {error && (
                                <div className={styles.errorBanner}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {clientSecret ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'stripe',
                                            variables: {
                                                colorPrimary: '#0056d2',
                                                borderRadius: '8px',
                                            },
                                        },
                                    }}
                                >
                                    <CheckoutForm onSuccess={handlePaymentSuccess} />
                                </Elements>
                            ) : (
                                <div className={styles.loadingPayment}>
                                    <div className={styles.spinner} />
                                    <p>Initializing secure payment...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
