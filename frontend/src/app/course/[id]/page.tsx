'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Header, VideoContainer, Sidebar, ProgressBar, Button } from '@/components';
import { getCourseById, getCurrentLesson } from '@/data/courses';
import { api } from '@/lib/api';

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const course = getCourseById(courseId);
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
      <div className={styles.coursePage}>
        <div className="container">
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.coursePage}>
        <div className="container">
          <Header />
          <main className={styles.main}>
            <div className={styles.notFound}>
              <h1 className={styles.notFoundTitle}>Course not found</h1>
              <p className={styles.notFoundText}>The course you're looking for doesn't exist.</p>
              <Link href="/courses">
                <Button>Back to courses</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentLesson = getCurrentLesson(course);

  const handleLessonClick = (lessonId: string) => {
    // Static frontend - no actual lesson switching
    console.log('Lesson clicked:', lessonId);
  };

  return (
    <div className={styles.coursePage}>
      <div className="container">
        <Header />
        <main className={styles.main}>
          <Link href="/courses" className={styles.backLink}>
            ← Back to courses
          </Link>
          
          <div className={styles.courseLayout}>
            <div className={styles.contentArea}>
              {/* Video Area */}
              <VideoContainer lessonTitle={currentLesson?.title || 'No lesson selected'} />
              
              {/* Progress + CTA Section */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <h2 className={styles.sectionTitle}>Your progress</h2>
                </div>
                <ProgressBar progress={course.progress} />
                <Button
                  disabled={course.status === 'completed'}
                  disabledReason={course.status === 'completed' ? 'Course completed' : undefined}
                >
                  {course.status === 'completed' ? 'Course completed' : 'Continue lesson'}
                </Button>
              </div>

              {/* Practice Assignment Section */}
              <div className={styles.practiceSection}>
                <h2 className={styles.sectionTitle}>Practice assignment</h2>
                <div className={styles.practiceContent}>
                  <p className={styles.practiceDescription}>
                    Complete the practice exercises to reinforce your learning.
                  </p>
                  <Button disabled disabledReason="Feature coming soon">
                    Start assignment
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebarWrapper}>
              <Sidebar
                modules={course.modules}
                courseTitle={course.title}
                onLessonClick={handleLessonClick}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
