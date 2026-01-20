'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReviewForm.module.css';
import { StarRating } from '../StarRating';
import { api, Review } from '@/lib/api';

interface ReviewFormProps {
  courseId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ courseId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch existing review on mount
  useEffect(() => {
    const fetchExistingReview = async () => {
      setIsFetching(true);
      try {
        const response = await api.getUserReview(courseId);
        if (response.success && response.data) {
          setExistingReview(response.data);
          setRating(response.data.rating);
          setComment(response.data.comment || '');
        }
      } catch (err) {
        console.error('Failed to fetch existing review:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingReview();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsLoading(true);

    try {
      // Use updateReview if editing, submitReview for new reviews
      const response = isEditing
        ? await api.updateReview(courseId, rating, comment || undefined)
        : await api.submitReview(courseId, rating, comment || undefined);

      if (response.success) {
        setExistingReview(response.data);
        setIsEditing(false);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setError(response.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restore original values
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  };

  const getRatingText = (r: number) => {
    switch (r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (isFetching) {
    return (
      <div className={styles.reviewForm}>
        <div className={styles.loadingState}>
          <p>Loading review...</p>
        </div>
      </div>
    );
  }

  // Show existing review if already reviewed AND not editing
  if (existingReview && !isEditing) {
    return (
      <div className={styles.reviewForm}>
        <div className={styles.existingReview}>
          <div className={styles.existingHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Your Review</h3>
            <button className={styles.editButton} onClick={handleEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          </div>
          <div className={styles.existingRating}>
            <StarRating rating={existingReview.rating} size="medium" />
            <span className={styles.ratingText}>{getRatingText(existingReview.rating)}</span>
          </div>
          {existingReview.comment && (
            <p className={styles.existingComment}>"{existingReview.comment}"</p>
          )}
          <div className={styles.existingDates}>
            <p className={styles.existingDate}>
              <span className={styles.dateLabel}>Submitted</span>
              {new Date(existingReview.createdAt || '').toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
            {existingReview.updatedAt && existingReview.createdAt !== existingReview.updatedAt && (
              <p className={styles.existingDate}>
                <span className={styles.dateLabel}>Edited</span>
                {new Date(existingReview.updatedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewForm}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {isEditing ? 'Edit your review' : 'Rate this course'}
        </h3>
        {!isExpanded && !isEditing && (
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(true)}
          >
            Write a review
          </button>
        )}
        {isEditing && (
          <button
            className={styles.cancelButton}
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.ratingSection}>
          <span className={styles.ratingLabel}>Your rating:</span>
          <StarRating
            rating={rating}
            size="large"
            interactive
            onChange={setRating}
          />
          {rating > 0 && (
            <span className={styles.ratingText}>{getRatingText(rating)}</span>
          )}
        </div>

        {(isExpanded || rating > 0 || isEditing) && (
          <>
            <div className={styles.commentSection}>
              <label htmlFor="reviewComment" className={styles.commentLabel}>
                Your review (optional)
              </label>
              <textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={styles.textarea}
                placeholder="Share your experience with this course..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || rating === 0}
            >
              {isLoading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

