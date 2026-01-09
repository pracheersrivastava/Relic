'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Header, CourseCard } from '@/components';
import { courses } from '@/data/courses';
import { api } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.coursesPage}>
        <div className="container">
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

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
