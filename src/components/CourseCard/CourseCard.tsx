import React from 'react';
import Link from 'next/link';
import styles from './CourseCard.module.css';
import { ProgressBar } from '../ProgressBar';
import { Button } from '../Button';
import { Course } from '@/data/courses';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const getStatusBadge = () => {
    switch (course.status) {
      case 'completed':
        return <span className={`${styles.statusBadge} ${styles.completed}`}>✓ Completed</span>;
      case 'in-progress':
        return <span className={`${styles.statusBadge} ${styles.inProgress}`}>In progress</span>;
      default:
        return <span className={`${styles.statusBadge} ${styles.notStarted}`}>Not started</span>;
    }
  };

  const getButtonText = () => {
    switch (course.status) {
      case 'completed':
        return 'Review course';
      case 'in-progress':
        return 'Continue learning';
      default:
        return 'Start course';
    }
  };

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{course.title}</h3>
      <p className={styles.description}>{course.description}</p>
      {getStatusBadge()}
      <div className={styles.cardFooter}>
        <ProgressBar progress={course.progress} />
        <Link href={`/course/${course.id}`}>
          <Button fullWidth>{getButtonText()}</Button>
        </Link>
      </div>
    </article>
  );
}
