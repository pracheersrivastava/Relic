'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import styles from './page.module.css';

export default function CheckoutCancelPage() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.icon}>🛒</div>
                    <h1>Payment Cancelled</h1>
                    <p>Your payment was cancelled. No charges were made.</p>
                    <p className={styles.subtext}>Your cart items are still saved.</p>

                    <div className={styles.buttons}>
                        <button
                            onClick={() => router.push('/cart')}
                            className={styles.primaryButton}
                        >
                            Return to Cart
                        </button>
                        <button
                            onClick={() => router.push('/courses')}
                            className={styles.secondaryButton}
                        >
                            Browse Courses
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
