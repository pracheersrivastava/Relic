'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Header, VideoContainer, Sidebar, ProgressBar, Button, ReviewForm } from '@/components';
import { api, Section, Course } from '@/lib/api';

// Convert backend sections to frontend Module format
interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'current' | 'locked';
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/');
      return;
    }

    const fetchCourseData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch enrolled courses to get course details
        const coursesResponse = await api.getEnrolledCourses();
        
        if (coursesResponse.success && coursesResponse.data) {
          const foundCourse = coursesResponse.data.find(c => c._id === courseId);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('You are not enrolled in this course');
            return;
          }
        }

        // Fetch course sections
        const sectionsResponse = await api.getCourseSections(courseId);
        
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
          
          // Convert sections to modules format for Sidebar component
          const convertedModules: Module[] = sectionsResponse.data.map((section, index) => ({
            id: section._id,
            title: section.title,
            lessons: [
              // Since we don't have lessons API yet, create placeholder lessons
              {
                id: `${section._id}-lesson-1`,
                title: `Lesson 1: Introduction`,
                duration: '10 min',
                status: index === 0 ? 'current' : 'locked' as const,
              },
              {
                id: `${section._id}-lesson-2`,
                title: `Lesson 2: Core Concepts`,
                duration: '15 min',
                status: 'locked' as const,
              },
            ],
          }));
          
          setModules(convertedModules);
        } else {
          // If no sections found, show empty state but still allow page
          setModules([]);
        }
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, router]);

  if (isLoading) {
    return (
      <div className={styles.coursePage}>
        <div className="container">
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.coursePage}>
        <div className="container">
          <Header />
          <main className={styles.main}>
            <div className={styles.notFound}>
              <h1 className={styles.notFoundTitle}>{error || 'Course not found'}</h1>
              <p className={styles.notFoundText}>The course you're looking for doesn't exist or you're not enrolled.</p>
              <Link href="/courses">
                <Button>Back to courses</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Get current lesson (first non-locked lesson)
  const currentLesson = modules.length > 0 
    ? modules[0].lessons.find(l => l.status === 'current') || modules[0].lessons[0]
    : null;

  const handleLessonClick = (lessonId: string) => {
    // When lesson API is available, this will switch the current lesson
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
                <ProgressBar progress={0} />
                <Button>
                  Continue lesson
                </Button>
              </div>

              {/* Review Section */}
              <ReviewForm courseId={courseId} />

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
              {modules.length > 0 ? (
                <Sidebar
                  modules={modules}
                  courseTitle={course.title}
                  onLessonClick={handleLessonClick}
                />
              ) : (
                <div className={styles.noSections}>
                  <h3>Course Sections</h3>
                  <p>No sections available yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
