import React from 'react';
import styles from './Sidebar.module.css';
import { Module, Lesson } from '@/data/courses';

interface SidebarProps {
  modules: Module[];
  courseTitle: string;
  onLessonClick?: (lessonId: string) => void;
}

function LessonIcon({ status }: { status: Lesson['status'] }) {
  switch (status) {
    case 'completed':
      return <span className={`${styles.lessonIcon} ${styles.completed}`}>✓</span>;
    case 'current':
      return <span className={`${styles.lessonIcon} ${styles.current}`}>●</span>;
    case 'locked':
      return <span className={`${styles.lessonIcon} ${styles.locked}`}>🔒</span>;
    default:
      return null;
  }
}

export function Sidebar({ modules, courseTitle, onLessonClick }: SidebarProps) {
  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status !== 'locked' && onLessonClick) {
      onLessonClick(lesson.id);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>{courseTitle}</h2>
      </div>
      <ul className={styles.moduleList}>
        {modules.map((module) => (
          <li key={module.id} className={styles.module}>
            <div className={styles.moduleTitle}>{module.title}</div>
            <ul className={styles.lessonList}>
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={`${styles.lesson} ${styles[lesson.status]}`}
                  onClick={() => handleLessonClick(lesson)}
                  role="button"
                  tabIndex={lesson.status !== 'locked' ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleLessonClick(lesson);
                    }
                  }}
                >
                  <LessonIcon status={lesson.status} />
                  <div className={styles.lessonContent}>
                    <div className={styles.lessonTitle}>{lesson.title}</div>
                    <div className={styles.lessonMeta}>
                      <span className={styles.lessonDuration}>{lesson.duration}</span>
                      {lesson.status === 'locked' && (
                        <span className={styles.backendPending}>Backend pending</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
