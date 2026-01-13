'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, cartCount, isLoading, removeFromCart, checkout, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleRemove = async (courseId: string) => {
    const result = await removeFromCart(courseId);
    if (result.success) {
      showToast('Course removed from cart', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const result = await checkout();
    setCheckoutLoading(false);
    
    if (result.success) {
      showToast('Checkout successful! Redirecting to your courses...', 'success');
      setTimeout(() => {
        router.push('/courses');
      }, 2000);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    if (result.success) {
      showToast('Cart cleared', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading cart...</p>
          </div>
        </main>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔐</div>
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your cart</p>
            <Link href="/login" className={styles.primaryButton}>
              Log In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cartCount === 0) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Explore courses and add them to your cart to get started</p>
            <Link href="/" className={styles.primaryButton}>
              Browse Courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Shopping Cart</h1>
            <span className={styles.itemCount}>{cartCount} Course{cartCount !== 1 ? 's' : ''} in Cart</span>
          </div>

          <div className={styles.content}>
            {/* Cart Items */}
            <div className={styles.cartItems}>
              {cart.items.map((item) => (
                <div key={item.courseId._id} className={styles.cartItem}>
                  <div className={styles.courseImage}>
                    <span className={styles.courseBadge}>C</span>
                  </div>
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseTitle}>{item.courseId.title}</h3>
                    {item.courseId.subtitle && (
                      <p className={styles.courseSubtitle}>{item.courseId.subtitle}</p>
                    )}
                    <div className={styles.courseMeta}>
                      <span className={styles.rating}>★ 4.5</span>
                      <span className={styles.students}>1,234 students</span>
                    </div>
                  </div>
                  <div className={styles.courseActions}>
                    <button 
                      className={styles.removeButton}
                      onClick={() => handleRemove(item.courseId._id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.coursePrice}>
                    <span className={styles.price}>${(item.courseId.price || item.price || 1).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                  <span>${(cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.courseId?.price || item.price || 1), 0)).toFixed(2)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discount}>-$0.00</span>
                </div>
                
                <div className={styles.summaryDivider} />
                
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>${(cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.courseId?.price || item.price || 1), 0)).toFixed(2)}</span>
                </div>

                <button 
                  className={styles.checkoutButton}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <span className={styles.buttonSpinner} />
                      Processing...
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>

                <button 
                  className={styles.clearButton}
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>

                <div className={styles.guarantee}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className={styles.promoCard}>
                <h4>Have a coupon?</h4>
                <div className={styles.promoInput}>
                  <input type="text" placeholder="Enter coupon code" />
                  <button>Apply</button>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping Link */}
          <div className={styles.continueSection}>
            <Link href="/" className={styles.continueLink}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
