'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Navbar } from '@/components';
import { api, Course, Section, getAccessToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────

interface LessonPreview {
  _id: string;
  title: string;
  duration: number; // seconds
  order: number;
}

interface SectionWithLessons extends Section {
  lessons: LessonPreview[];
  totalDuration: number; // seconds
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatHours = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatDurationMin = (seconds: number): string => {
  const m = Math.round(seconds / 60);
  return `${m} min`;
};

const StarRating = ({ rating, count }: { rating: number; count: number }) => {
  return (
    <div className={styles.starRow}>
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
      <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} viewBox="0 0 20 20" width="16" height="16" className={rating >= s ? styles.starFilled : rating >= s - 0.5 ? styles.starHalf : styles.starEmpty}>
            <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </span>
      <span className={styles.ratingCount}>({count.toLocaleString()} ratings)</span>
    </div>
  );
};

// ── Page Component ─────────────────────────────────────────────────────────────

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'about' | 'outcomes' | 'courses' | 'testimonials'>('about');
  const heroRef = useRef<HTMLDivElement>(null);
  const [stickyCard, setStickyCard] = useState(false);

  // Total stats
  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalDuration = sections.reduce((sum, s) => sum + s.totalDuration, 0);

  // Sticky sidebar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setStickyCard(window.scrollY > heroRef.current.offsetHeight - 80);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch course + sections
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // 1. Fetch all courses and find this one (public endpoint)
        const coursesRes = await api.getAllCourses();
        if (!coursesRes.success) {
          setError('Course not found.');
          setIsLoading(false);
          return;
        }
        const found = coursesRes.data.find((c) => c._id === courseId);
        if (!found) {
          setError('Course not found.');
          setIsLoading(false);
          return;
        }
        setCourse(found);

        // 2. Fetch sections (public endpoint)
        const sectionsRes = await api.getCourseSections(courseId);
        if (sectionsRes.success && sectionsRes.data?.length > 0) {
          // For each section, fetch its lessons
          const sectionsWithLessons: SectionWithLessons[] = await Promise.all(
            sectionsRes.data.map(async (section) => {
              try {
                const token = getAccessToken();
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/lessons/sections/${section._id}/lessons`,
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                  }
                );
                const data = await res.json();
                const lessons: LessonPreview[] = data.success ? data.data : [];
                const totalDuration = lessons.reduce((s: number, l: LessonPreview) => s + (l.duration || 0), 0);
                return { ...section, lessons, totalDuration };
              } catch {
                return { ...section, lessons: [], totalDuration: 0 };
              }
            })
          );
          setSections(sectionsWithLessons);
          // Open first section by default
          if (sectionsWithLessons.length > 0) {
            setOpenSections(new Set([sectionsWithLessons[0]._id]));
          }
        }

        // 3. Check enrollment status if logged in
        if (api.isAuthenticated()) {
          const enrolledRes = await api.getEnrolledCourses();
          if (enrolledRes.success) {
            setIsEnrolled(enrolledRes.data.some((c) => c._id === courseId));
          }
        }
      } catch {
        setError('Failed to load course details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  const handleAddToCart = async () => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAddingToCart(true);
    setCartMsg('');
    try {
      const res = await api.addToCart(courseId);
      if (res.success) {
        setCartMsg('Added to cart!');
      } else {
        // If session expired during the call, redirect to login
        if (res.statusCode === 401) {
          router.push('/login');
          return;
        }
        setCartMsg(res.message || 'Failed to add to cart');
      }
    } catch {
      setCartMsg('Failed to add to cart');
    }
    setIsAddingToCart(false);
  };

  const handleGoToCourse = () => {
    router.push(`/course/${courseId}`);
  };

  // ── Render: Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p>Loading course details…</p>
        </div>
      </div>
    );
  }

  // ── Render: Error ────────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.errorScreen}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>{error || 'Course not found'}</h2>
          <Link href="/courses" className={styles.backBtn}>← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const rating = course.averageRating ?? 0;
  const reviewCount = course.totalReviews ?? 0;

  // Mock enrichment data (real data would come from backend enhancements)
  const learningOutcomes = [
    'Master the core concepts and apply them to real-world projects',
    'Build confidence in solving complex problems end-to-end',
    'Understand best practices used in modern industry workflows',
    'Earn a shareable certificate to add to your professional profile',
  ];

  const skills = [
    'Project Planning', 'Critical Thinking', 'Problem Solving',
    'Data Analysis', 'Collaboration', 'Communication',
  ];

  // ── Render: Main ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbInner}>
          <Link href="/">Home</Link>
          <span className={styles.breadSep}>›</span>
          <Link href="/courses">Courses</Link>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadCurrent}>{course.title}</span>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            {/* Provider badge */}
            <div className={styles.providerBadge}>
              <div className={styles.providerLogo}>R</div>
              <span>Relic</span>
            </div>

            <h1 className={styles.courseTitle}>{course.title}</h1>
            {course.subtitle && (
              <p className={styles.courseSubtitle}>{course.subtitle}</p>
            )}

            {/* Rating row */}
            {rating > 0 && <StarRating rating={rating} count={reviewCount} />}

            {/* Meta pills */}
            <div className={styles.metaPills}>
              {totalDuration > 0 && (
                <span className={styles.pill}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
                  {formatHours(totalDuration)} total
                </span>
              )}
              {totalLessons > 0 && (
                <span className={styles.pill}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>
                  {totalLessons} lessons
                </span>
              )}
              {sections.length > 0 && (
                <span className={styles.pill}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                  {sections.length} sections
                </span>
              )}
              <span className={styles.pill}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                Flexible schedule
              </span>
            </div>
          </div>

          {/* Hero right spacer (card is sticky sidebar on desktop) */}
          <div className={styles.heroSpacer} />
        </div>
      </div>

      {/* ── Body Layout ── */}
      <div className={styles.body}>
        <div className={styles.bodyInner}>
          {/* ── Left: Main Content ── */}
          <div className={styles.mainCol}>

            {/* Sticky Tab Nav */}
            <div className={styles.tabBar}>
              {(['about', 'outcomes', 'courses', 'testimonials'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                  id={`tab-${tab}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ── About / Description ── */}
            {activeTab === 'about' && (
              <section className={styles.section} id="section-about">
                {course.description && (
                  <div className={styles.description}>
                    <h2 className={styles.sectionTitle}>About this course</h2>
                    <p className={styles.descText}>{course.description}</p>
                  </div>
                )}

                {/* Details to know */}
                <div className={styles.detailsGrid}>
                  <div className={styles.detailCard}>
                    <span className={styles.detailIcon}>📜</span>
                    <div>
                      <strong>Shareable certificate</strong>
                      <p>Add to your LinkedIn profile</p>
                    </div>
                  </div>
                  <div className={styles.detailCard}>
                    <span className={styles.detailIcon}>🌐</span>
                    <div>
                      <strong>Taught in English</strong>
                      <p>Multiple languages available</p>
                    </div>
                  </div>
                  <div className={styles.detailCard}>
                    <span className={styles.detailIcon}>📅</span>
                    <div>
                      <strong>Flexible schedule</strong>
                      <p>Learn at your own pace</p>
                    </div>
                  </div>
                  {totalDuration > 0 && (
                    <div className={styles.detailCard}>
                      <span className={styles.detailIcon}>⏱️</span>
                      <div>
                        <strong>{formatHours(totalDuration)}</strong>
                        <p>of video content</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Outcomes ── */}
            {activeTab === 'outcomes' && (
              <section className={styles.section} id="section-outcomes">
                <h2 className={styles.sectionTitle}>What you&apos;ll learn</h2>
                <div className={styles.outcomesGrid}>
                  {learningOutcomes.map((item, i) => (
                    <div key={i} className={styles.outcomeItem}>
                      <svg className={styles.checkIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.skillsBlock}>
                  <h3 className={styles.subSectionTitle}>Skills you&apos;ll gain</h3>
                  <div className={styles.skillTags}>
                    {skills.map((s) => (
                      <span key={s} className={styles.skillTag}>{s}</span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Course Curriculum ── */}
            {activeTab === 'courses' && (
              <section className={styles.section} id="section-courses">
                <div className={styles.curriculumHeader}>
                  <h2 className={styles.sectionTitle}>Course curriculum</h2>
                  {sections.length > 0 && (
                    <span className={styles.curriculumMeta}>
                      {sections.length} sections · {totalLessons} lessons · {formatHours(totalDuration)} total
                    </span>
                  )}
                </div>

                {sections.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span>📚</span>
                    <p>Curriculum content coming soon</p>
                  </div>
                ) : (
                  <div className={styles.accordion}>
                    {sections.map((section, idx) => {
                      const isOpen = openSections.has(section._id);
                      return (
                        <div key={section._id} className={`${styles.accordionItem} ${isOpen ? styles.accordionOpen : ''}`}>
                          <button
                            className={styles.accordionHeader}
                            onClick={() => toggleSection(section._id)}
                            id={`section-toggle-${idx}`}
                          >
                            <div className={styles.accordionLeft}>
                              <svg
                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                              >
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                              </svg>
                              <span className={styles.sectionName}>
                                Section {idx + 1}: {section.title}
                              </span>
                            </div>
                            <div className={styles.accordionRight}>
                              {section.lessons.length > 0 && (
                                <span className={styles.sectionMeta}>
                                  {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                                  {section.totalDuration > 0 && ` · ${formatHours(section.totalDuration)}`}
                                </span>
                              )}
                            </div>
                          </button>

                          {isOpen && (
                            <div className={styles.accordionBody}>
                              {section.lessons.length === 0 ? (
                                <p className={styles.noLessons}>No lessons in this section yet.</p>
                              ) : (
                                section.lessons.map((lesson, li) => (
                                  <div key={lesson._id} className={styles.lessonRow}>
                                    <div className={styles.lessonLeft}>
                                      <svg viewBox="0 0 24 24" width="16" height="16" className={styles.videoIcon} fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                      <span className={styles.lessonTitle}>{lesson.title}</span>
                                    </div>
                                    {lesson.duration > 0 && (
                                      <span className={styles.lessonDuration}>{formatDurationMin(lesson.duration)}</span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ── Testimonials (placeholder) ── */}
            {activeTab === 'testimonials' && (
              <section className={styles.section} id="section-testimonials">
                <h2 className={styles.sectionTitle}>Learner reviews</h2>
                {reviewCount === 0 ? (
                  <div className={styles.emptyState}>
                    <span>💬</span>
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                ) : (
                  <div className={styles.reviewSummary}>
                    <div className={styles.ratingBig}>
                      <span className={styles.ratingBigNum}>{rating.toFixed(1)}</span>
                      <StarRating rating={rating} count={reviewCount} />
                      <p className={styles.ratingLabel}>Course rating</p>
                    </div>
                    <div className={styles.reviewNote}>
                      <p>Based on <strong>{reviewCount.toLocaleString()}</strong> learner ratings.</p>
                      <p className={styles.reviewSubNote}>Enroll in this course to leave your own review.</p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Right: Enrollment Card ── */}
          <aside className={`${styles.sideCard} ${stickyCard ? styles.sideCardSticky : ''}`}>
            <div className={styles.cardInner}>
              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  {`$${(course.price || 1).toFixed(2)}`}
                </span>
              </div>

              {/* CTA Buttons */}
              {isEnrolled ? (
                <>
                  <div className={styles.enrolledBadge}>✅ Already enrolled</div>
                  <button className={styles.ctaPrimary} onClick={handleGoToCourse} id="btn-go-to-course">
                    Continue learning →
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.ctaPrimary}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    id="btn-add-to-cart"
                  >
                    {isAddingToCart ? 'Adding…' : 'Enroll Now'}
                  </button>
                  {course.price > 0 && (
                    <button
                      className={styles.ctaSecondary}
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      id="btn-try-free"
                    >
                      Try for free
                    </button>
                  )}
                  {cartMsg && (
                    <p className={`${styles.cartMsg} ${cartMsg.includes('Added') ? styles.cartMsgSuccess : styles.cartMsgError}`}>
                      {cartMsg}
                    </p>
                  )}
                </>
              )}

              {/* Includes */}
              <div className={styles.includesBlock}>
                <p className={styles.includesTitle}>This course includes:</p>
                <ul className={styles.includesList}>
                  {totalLessons > 0 && (
                    <li>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      {totalLessons} on-demand video{totalLessons !== 1 ? 's' : ''}
                    </li>
                  )}
                  {totalDuration > 0 && (
                    <li>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
                      {formatHours(totalDuration)} of content
                    </li>
                  )}
                  <li>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.38C18 2.5 15.5 0 12.38 0c-1.76 0-3.2.86-4.1 2.14L12 5.5l3.72-3.36C16.42 2.06 17 2.77 17 3.62c0 1.24-1.12 2.38-2.64 3.38H20v1H4V7h5.64C7.12 6 6 4.86 6 3.62c0-.85.58-1.56 1.28-1.48L11 5.5 14.72 2.14C13.82.86 12.37 0 10.62 0z"/></svg>
                    Shareable certificate
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                    Full lifetime access
                  </li>
                </ul>
              </div>

              {/* Rating summary in card */}
              {rating > 0 && (
                <div className={styles.cardRating}>
                  <StarRating rating={rating} count={reviewCount} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
