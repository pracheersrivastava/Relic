'use client';

import React from 'react';
import styles from './page.module.css';
import { Header, CourseCard } from '@/components';
import { courses } from '@/data/courses';

export default function CoursesPage() {
  return (
    <div className={styles.coursesPage}>
      <div className="container">
        <Header />
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>My courses</h1>
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
