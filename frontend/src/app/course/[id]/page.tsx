'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Header, Sidebar, ProgressBar, Button, ReviewForm, VideoPlayer } from '@/components';
import { api, Course, CourseLearningData } from '@/lib/api';

// Frontend Lesson format for Sidebar
interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'current' | 'locked';
  videoUrl?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Format duration from seconds to "X min" format
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0 min';
  const mins = Math.round(seconds / 60);
  return mins === 1 ? '1 min' : `${mins} min`;
};

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [currentLessonTitle, setCurrentLessonTitle] = useState<string>('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [error, setError] = useState('');

  // Debounce progress updates to avoid too many API calls
  const progressDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get all lessons in a flat array
  const getAllLessons = useCallback((): Lesson[] => {
    return modules.flatMap(m => m.lessons);
  }, [modules]);

  // Get current lesson index
  const getCurrentLessonIndex = useCallback((): number => {
    const allLessons = getAllLessons();
    return allLessons.findIndex(l => l.id === currentLessonId);
  }, [getAllLessons, currentLessonId]);

  // Check if there's a previous lesson
  const hasPreviousLesson = useCallback((): boolean => {
    return getCurrentLessonIndex() > 0;
  }, [getCurrentLessonIndex]);

  // Check if there's a next lesson
  const hasNextLesson = useCallback((): boolean => {
    const allLessons = getAllLessons();
    return getCurrentLessonIndex() < allLessons.length - 1;
  }, [getAllLessons, getCurrentLessonIndex]);

  // Calculate course completion percentage
  const getCourseProgress = useCallback((): number => {
    const allLessons = getAllLessons();
    if (allLessons.length === 0) return 0;
    return Math.round((completedLessons.size / allLessons.length) * 100);
  }, [getAllLessons, completedLessons]);

  // Handle lesson click
  const handleLessonClick = useCallback((lessonId: string) => {
    const allLessons = getAllLessons();
    const lesson = allLessons.find(l => l.id === lessonId);
    if (lesson && lesson.videoUrl) {
      setCurrentLessonId(lessonId);
      setCurrentVideoUrl(lesson.videoUrl);
      setCurrentLessonTitle(lesson.title);
      setVideoProgress(0);
      // Save last watched course and lesson for homepage widget
      localStorage.setItem('lastWatchedCourse', courseId);
      localStorage.setItem('lastWatchedLesson', lessonId);
    }
  }, [getAllLessons, courseId]);

  // Mark current lesson as completed
  const markCurrentLessonCompleted = useCallback(async () => {
    if (!currentLessonId) return;

    try {
      await api.markLessonCompleted(currentLessonId);
      setCompletedLessons(prev => new Set(Array.from(prev).concat([currentLessonId])));

      // Update module lessons to show completed status
      setModules(prevModules =>
        prevModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            status: lesson.id === currentLessonId ? 'completed' : lesson.status,
          })),
        }))
      );
    } catch (err) {
      console.error('Failed to mark lesson as completed:', err);
    }
  }, [currentLessonId]);

  // Handle video ended - mark as completed (next lesson popup handles navigation)
  const handleVideoEnded = useCallback(async () => {
    // Mark current lesson as completed
    await markCurrentLessonCompleted();
  }, [markCurrentLessonCompleted]);

  // Handle video progress
  const handleVideoProgress = useCallback((progress: number) => {
    setVideoProgress(progress);

    // Debounce progress updates to backend
    if (currentLessonId && progress > 0) {
      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
      }
      progressDebounceRef.current = setTimeout(async () => {
        try {
          await api.markLessonProgress(currentLessonId, Math.round(progress));
        } catch (err) {
          // Silent fail for progress updates
        }
      }, 5000); // Update every 5 seconds
    }
  }, [currentLessonId]);

  // Go to previous lesson
  const handlePreviousLesson = useCallback(() => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();

    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      if (prevLesson.videoUrl) {
        handleLessonClick(prevLesson.id);
      }
    }
  }, [getAllLessons, getCurrentLessonIndex, handleLessonClick]);

  // Go to next lesson
  const handleNextLesson = useCallback(() => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();

    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (nextLesson.videoUrl) {
        handleLessonClick(nextLesson.id);
      }
    }
  }, [getAllLessons, getCurrentLessonIndex, handleLessonClick]);

  // Fetch course data on mount
  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/');
      return;
    }

    const fetchCourseData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.getCourseLearningData(courseId);

        if (!response.success || !response.data) {
          setError(response.message || 'Failed to load course data');
          setIsLoading(false);
          return;
        }

        const { course: courseData, sections, completedLessonIds } = response.data as CourseLearningData;

        setCourse(courseData);

        const completedSet = new Set<string>(completedLessonIds || []);
        setCompletedLessons(completedSet);

        const modulesWithLessons: Module[] = sections.map((section) => ({
          id: section._id,
          title: section.title,
          lessons: (section.lessons || []).map((lesson) => ({
            id: lesson._id,
            title: lesson.title,
            duration: formatDuration(lesson.duration),
            status: completedSet.has(lesson._id) ? 'completed' : 'current',
            videoUrl: lesson.videoUrl,
          })),
        }));

        setModules(modulesWithLessons);

        // Set initial lesson (first non-completed lesson with a video URL)
        let initialLesson: Lesson | undefined;
        for (const module of modulesWithLessons) {
          for (const lesson of module.lessons) {
            if (lesson.videoUrl && !completedSet.has(lesson.id)) {
              initialLesson = lesson;
              break;
            }
          }
          if (initialLesson) break;
        }

        // If all lessons completed, start from first with a video
        if (!initialLesson) {
          for (const module of modulesWithLessons) {
            const firstWithVideo = module.lessons.find((l) => l.videoUrl);
            if (firstWithVideo) {
              initialLesson = firstWithVideo;
              break;
            }
          }
        }

        if (initialLesson) {
          setCurrentLessonId(initialLesson.id);
          setCurrentVideoUrl(initialLesson.videoUrl || '');
          setCurrentLessonTitle(initialLesson.title);
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
      }
    };
  }, []);

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

  const courseProgress = getCourseProgress();

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
              {/* Video Player */}
              {currentVideoUrl ? (
                (() => {
                  // Calculate next lesson info for popup
                  const allLessons = getAllLessons();
                  const currentIndex = getCurrentLessonIndex();
                  const nextLessonData = currentIndex < allLessons.length - 1
                    ? allLessons[currentIndex + 1]
                    : null;

                  return (
                    <VideoPlayer
                      videoUrl={currentVideoUrl}
                      lessonTitle={currentLessonTitle}
                      nextLesson={nextLessonData ? {
                        title: nextLessonData.title,
                        duration: nextLessonData.duration,
                      } : undefined}
                      onEnded={handleVideoEnded}
                      onProgress={handleVideoProgress}
                      onStartNext={handleNextLesson}
                    />
                  );
                })()
              ) : (
                <div className={styles.noVideo}>
                  <div className={styles.noVideoContent}>
                    <span className={styles.noVideoIcon}>🎬</span>
                    <p>Select a lesson from the sidebar to start watching</p>
                  </div>
                </div>
              )}

              {/* Lesson Navigation */}
              <div className={styles.lessonNavigation}>
                <button
                  className={`${styles.navButton} ${!hasPreviousLesson() ? styles.disabled : ''}`}
                  onClick={handlePreviousLesson}
                  disabled={!hasPreviousLesson()}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                  Previous
                </button>

                <span className={styles.lessonCounter}>
                  Lesson {getCurrentLessonIndex() + 1} of {getAllLessons().length}
                </span>

                <button
                  className={`${styles.navButton} ${!hasNextLesson() ? styles.disabled : ''}`}
                  onClick={handleNextLesson}
                  disabled={!hasNextLesson()}
                >
                  Next
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </div>

              {/* Progress Section */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <h2 className={styles.sectionTitle}>Course Progress</h2>
                  <span className={styles.progressPercent}>{courseProgress}%</span>
                </div>
                <ProgressBar progress={courseProgress} />
                <p className={styles.progressText}>
                  {completedLessons.size} of {getAllLessons().length} lessons completed
                </p>
                {currentLessonId && !completedLessons.has(currentLessonId) && (
                  <Button onClick={markCurrentLessonCompleted}>
                    Mark as complete
                  </Button>
                )}
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
                  currentLessonId={currentLessonId || undefined}
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
