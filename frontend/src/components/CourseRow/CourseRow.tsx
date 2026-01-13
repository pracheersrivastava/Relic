'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './CourseRow.module.css';
import { HomepageCourseCard } from '../HomepageCourseCard';
import { HomepageCourse } from '@/data/homepageData';

interface CourseRowProps {
  title: string;
  courses: HomepageCourse[];
  direction?: 'left' | 'right';
}

export const CourseRow: React.FC<CourseRowProps> = ({ 
  title, 
  courses,
  direction = 'left' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Duplicate courses for infinite scroll effect
  const duplicatedCourses = [...courses, ...courses, ...courses];

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = direction === 'left' ? 0 : scrollContainer.scrollWidth / 3;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        if (direction === 'left') {
          scrollPosition += 0.3;
          if (scrollPosition >= scrollContainer.scrollWidth / 3) {
            scrollPosition = 0;
          }
        } else {
          scrollPosition -= 0.3;
          if (scrollPosition <= 0) {
            scrollPosition = scrollContainer.scrollWidth / 3;
          }
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, direction]);

  const scrollByAmount = (amount: number) => {
    if (!scrollRef.current) return;
    setIsPaused(true);
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
    // Resume auto-scroll after 3 seconds
    setTimeout(() => setIsPaused(false), 3000);
  };

  const scrollLeft = () => scrollByAmount(-320);
  const scrollRight = () => scrollByAmount(320);

  return (
    <section className={styles.courseSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.controls}>
          <button 
            className={`${styles.arrowButton} ${styles.arrowLeft} ${!canScrollLeft ? styles.disabled : ''}`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className={`${styles.arrowButton} ${styles.arrowRight}`}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button className={styles.viewAllButton}>
            View all
          </button>
        </div>
      </div>
      <div className={styles.trackWrapper}>
        <div className={styles.gradientLeft} />
        <div
          ref={scrollRef}
          className={styles.courseTrack}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onScroll={updateScrollButtons}
        >
          {duplicatedCourses.map((course, index) => (
            <div key={`${course.id}-${index}`} className={styles.cardWrapper}>
              <HomepageCourseCard course={course} />
            </div>
          ))}
        </div>
        <div className={styles.gradientRight} />
      </div>
    </section>
  );
};

export default CourseRow;
