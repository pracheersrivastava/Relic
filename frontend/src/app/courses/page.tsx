'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Navbar } from '@/components';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Extended course with progress info
interface CourseWithProgress extends Course {
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

export default function CoursesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getEnrolledCourses();
        if (response.success && response.data) {
          // Fetch progress for each course
          const coursesWithProgress: CourseWithProgress[] = await Promise.all(
            response.data.map(async (course) => {
              let totalLessons = 0;
              let completedLessons = 0;

              try {
                // Get sections for this course
                const sectionsResponse = await api.getCourseSections(course._id);

                if (sectionsResponse.success && sectionsResponse.data) {
                  // For each section, get lessons and completed count
                  await Promise.all(
                    sectionsResponse.data.map(async (section) => {
                      try {
                        const lessonsResponse = await api.getSectionLessons(section._id);
                        if (lessonsResponse.success && lessonsResponse.data) {
                          totalLessons += lessonsResponse.data.length;
                        }

                        const completedResponse = await api.getCompletedLessons(section._id);
                        if (completedResponse.success && completedResponse.data) {
                          completedLessons += completedResponse.data.length;
                        }
                      } catch (err) {
                        // Silently fail for individual sections
                      }
                    })
                  );
                }
              } catch (err) {
                // Silently fail for course progress
              }

              const progress = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

              return {
                ...course,
                progress,
                totalLessons,
                completedLessons,
              };
            })
          );

          setCourses(coursesWithProgress);
        }
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchEnrolledCourses();
    }
  }, [isAuthenticated, authLoading]);

  // Filter courses based on active tab
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return course.progress > 0 && course.progress < 100;
    if (activeTab === 'completed') return course.progress === 100;
    return true;
  });

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your courses...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔐</div>
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your courses</p>
            <Link href="/login" className={styles.primaryButton}>
              Log In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // No enrolled courses
  if (courses.length === 0) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1 className={styles.pageTitle}>My Learning</h1>
            </div>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📚</div>
              <h2>No courses yet</h2>
              <p>Start your learning journey by enrolling in a course</p>
              <Link href="/" className={styles.primaryButton}>
                Browse Courses
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>My Learning</h1>
            <p className={styles.subtitle}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Courses
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'in-progress' ? styles.active : ''}`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>

          {/* Course Grid */}
          <div className={styles.courseGrid}>
            {filteredCourses.length === 0 ? (
              <div className={styles.emptyTabState}>
                <p>No courses in this category</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <div className={styles.progressOverlay}>
                      <div
                        className={styles.progressRing}
                        style={{ '--progress': course.progress.toString() } as React.CSSProperties}
                      >
                        <span>{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.courseContent}>
                    <div className={styles.courseProvider}>
                      <span className={styles.providerBadge}>C</span>
                      <span className={styles.providerName}>Coursera</span>
                    </div>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    {course.subtitle && (
                      <p className={styles.courseSubtitle}>{course.subtitle}</p>
                    )}
                    <div className={styles.courseProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {course.progress === 0
                          ? 'Not started'
                          : course.progress === 100
                            ? 'Complete!'
                            : `${course.progress}% complete`}
                      </span>
                    </div>
                    <Link
                      href={`/course/${course._id}`}
                      className={styles.continueButton}
                    >
                      {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
