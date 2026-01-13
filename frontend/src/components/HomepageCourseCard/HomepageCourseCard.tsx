'use client';

import React, { useState } from 'react';
import styles from './HomepageCourseCard.module.css';
import { HomepageCourse } from '@/data/homepageData';

interface HomepageCourseCardProps {
  course: HomepageCourse;
}

export const HomepageCourseCard: React.FC<HomepageCourseCardProps> = ({ course }) => {
  const [showToast, setShowToast] = useState(false);

  const handleViewCourse = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starHalf}>★</span>);
    }

    return stars;
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {course.image && course.image.startsWith('http') ? (
            <img 
              src={course.image} 
              alt={course.title}
              className={styles.courseImage}
            />
          ) : (
            <div className={styles.placeholderImage}>
              <span className={styles.providerBadge}>{course.providerLogo}</span>
            </div>
          )}
          <span className={styles.providerBadge}>{course.providerLogo}</span>
        </div>
        <div className={styles.content}>
          <div className={styles.providerRow}>
            <span className={styles.providerName}>{course.provider}</span>
          </div>
          <h3 className={styles.title}>{course.title}</h3>
          <span className={styles.type}>{course.type}</span>
          <div className={styles.ratingRow}>
            <span className={styles.rating}>{Number(course.rating).toFixed(1)}</span>
            <div className={styles.stars}>{renderStars(course.rating)}</div>
            <span className={styles.reviewCount}>({course.reviewCount})</span>
          </div>
          {course.price !== undefined && (
            <div className={styles.priceRow}>
              <span className={styles.price}>${course.price}</span>
            </div>
          )}
          <button className={styles.viewButton} onClick={handleViewCourse}>
            View Course
          </button>
        </div>
      </div>
      {showToast && (
        <div className={styles.toast}>
          Course details page not implemented
        </div>
      )}
    </>
  );
};

export default HomepageCourseCard;
