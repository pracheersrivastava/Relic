'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { Navbar, HeroBanner, CourseRow, CategoryCards, WelcomeWidget } from '@/components';
import {
  partners,
  HomepageCourse
} from '@/data/homepageData';
import { api, Course } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// Dummy course images from Unsplash
const courseImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
];

// Format review count for display
const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  }
  return count.toString();
};

// Convert backend course to homepage format
const convertToHomepageCourse = (course: Course, index: number): HomepageCourse => ({
  id: course._id,
  title: course.title,
  provider: 'Relic',
  providerLogo: 'C',
  image: courseImages[index % courseImages.length],
  rating: course.averageRating || 0,
  reviewCount: formatReviewCount(course.totalReviews || 0),
  type: 'Course',
  price: course.price || 1,
});

export default function HomePage() {
  const [backendCourses, setBackendCourses] = useState<HomepageCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.getAllCourses();
        if (response.success && response.data) {
          const converted = response.data.map((course, index) => convertToHomepageCourse(course, index));
          setBackendCourses(converted);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddToCart = async (courseId: string) => {
    // Check user directly instead of isAuthenticated to avoid stale closure
    const token = localStorage.getItem('accessToken');
    if (!token && !user) {
      showToast('Please login to add courses to cart', 'error');
      return;
    }

    const result = await addToCart(courseId);
    if (result.success) {
      showToast('Course added to cart!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className={styles.homepage}>
      <Navbar />

      <main className={styles.main}>
        {/* Welcome Widget - shows for logged in users (above hero) */}
        <WelcomeWidget />

        <HeroBanner />

        <CategoryCards />

        {/* Partners Section */}
        <section className={styles.partnersSection}>
          <h3 className={styles.partnersTitle}>
            Learn from 350+ leading universities and companies
          </h3>
          <div className={styles.partnersRow}>
            {partners.map((partner) => (
              <div key={partner.name} className={styles.partnerBadge}>
                <span className={styles.partnerLogo}>{partner.logo}</span>
                <span className={styles.partnerName}>{partner.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Available Courses from Backend */}
        {backendCourses.length > 0 && (
          <section className={styles.availableCoursesSection}>
            <div className={styles.sectionHeaderWithAction}>
              <div>
                <h2 className={styles.sectionMainTitle}>Available Courses</h2>
                <p className={styles.sectionSubtitle}>Start learning today with these courses</p>
              </div>
              <span className={styles.viewAllLink}>Featured catalog</span>
            </div>
            <div className={styles.courseGrid}>
              {backendCourses.slice(0, 8).map((course) => (
                <div key={course.id} className={styles.courseCardNew}>
                  <div className={styles.courseCardImage}>
                    {course.image && course.image.startsWith('http') ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className={styles.courseCardImg}
                      />
                    ) : null}
                    <span className={styles.courseCardBadge}>{course.providerLogo}</span>
                  </div>
                  <div className={styles.courseCardContent}>
                    <span className={styles.courseCardProvider}>{course.provider}</span>
                    <h3 className={styles.courseCardTitle}>{course.title}</h3>
                    <div className={styles.courseCardMeta}>
                      <span className={styles.courseCardRating}>
                        ★ {Number(course.rating).toFixed(1)}
                      </span>
                      <span className={styles.courseCardReviews}>
                        ({course.reviewCount} reviews)
                      </span>
                    </div>
                    <div className={styles.courseCardPrice}>
                      <span className={styles.courseCardPriceValue}>${course.price || 1}</span>
                    </div>
                    <div className={styles.courseCardActions}>
                      <Link href={`/courses/${course.id}`} className={styles.courseCardViewBtn}>
                        View Details
                      </Link>
                      <button
                        className={styles.courseCardCartBtn}
                        onClick={() => handleAddToCart(course.id)}
                        title="Add to Cart"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Course Sections with Auto-Scroll */}
        {backendCourses.length > 0 && (
          <section className={styles.courseSections}>
            <h2 className={styles.sectionMainTitle}>Trending courses</h2>

            <CourseRow
              title="Most popular →"
              courses={backendCourses}
              direction="left"
            />

            <CourseRow
              title="Weekly spotlight →"
              courses={backendCourses}
              direction="right"
            />

            <CourseRow
              title="In-demand AI skills →"
              courses={backendCourses}
              direction="left"
            />

            <CourseRow
              title="New courses →"
              courses={backendCourses}
              direction="right"
            />
          </section>
        )}
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>Relic</span>
            <p className={styles.footerTagline}>
              Learn without limits
            </p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Relic</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Catalog</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Community</h4>
              <a href="#">Learners</a>
              <a href="#">Partners</a>
              <a href="#">Developers</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>More</h4>
              <a href="#">Press</a>
              <a href="#">Contact</a>
              <a href="#">Help</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 Relic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

