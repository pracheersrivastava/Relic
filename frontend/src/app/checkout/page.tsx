'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { cart, cartCount, isLoading: cartLoading } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                setError(data.error || 'Failed to create checkout session');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
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

                        {/* Payment Section */}
                        <div className={styles.paymentSection}>
                            <h3 className={styles.sectionTitle}>Payment</h3>

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

                            <div className={styles.stripeInfo}>
                                <p>You will be redirected to Stripe&apos;s secure checkout page to complete your payment.</p>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className={styles.payButton}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className={styles.buttonSpinner} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        Pay with Stripe
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

                            <div className={styles.testCards}>
                                <p className={styles.testCardsTitle}>Test Cards:</p>
                                <ul>
                                    <li><code>4242 4242 4242 4242</code> - Success</li>
                                    <li><code>4000 0000 0000 9995</code> - Declined</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
