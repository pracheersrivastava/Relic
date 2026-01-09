'use client';

import React, { useRef, useState, useEffect } from 'react';
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

  // Duplicate courses for infinite scroll effect
  const duplicatedCourses = [...courses, ...courses];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = direction === 'left' ? 0 : scrollContainer.scrollWidth / 2;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        if (direction === 'left') {
          scrollPosition += 0.5;
          if (scrollPosition >= scrollContainer.scrollWidth / 2) {
            scrollPosition = 0;
          }
        } else {
          scrollPosition -= 0.5;
          if (scrollPosition <= 0) {
            scrollPosition = scrollContainer.scrollWidth / 2;
          }
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, direction]);

  return (
    <section className={styles.courseSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <button className={styles.viewAllButton}>
          View all →
        </button>
      </div>
      <div
        ref={scrollRef}
        className={styles.courseTrack}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedCourses.map((course, index) => (
          <HomepageCourseCard key={`${course.id}-${index}`} course={course} />
        ))}
      </div>
    </section>
  );
};

export default CourseRow;
