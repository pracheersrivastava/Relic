'use client';

import React from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'medium',
  interactive = false,
  onChange 
}: StarRatingProps) {
  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(starIndex + 1);
    }
  };

  return (
    <div className={`${styles.starRating} ${styles[size]}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const isFilled = index < rating;
        return (
          <span
            key={index}
            className={`${styles.star} ${isFilled ? styles.filled : styles.empty} ${interactive ? styles.interactive : ''}`}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : 'presentation'}
            aria-label={interactive ? `Rate ${index + 1} stars` : undefined}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
