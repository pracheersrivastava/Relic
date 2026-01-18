import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { Module, Lesson } from '@/data/courses';

interface SidebarProps {
  modules: Module[];
  courseTitle: string;
  currentLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
}

function LessonIcon({ status, isActive }: { status: Lesson['status']; isActive: boolean }) {
  if (status === 'completed') {
    return (
      <span className={`${styles.lessonIcon} ${styles.completed}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </span>
    );
  }

  if (isActive) {
    return (
      <span className={`${styles.lessonIcon} ${styles.current}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </span>
    );
  }

  return (
    <span className={`${styles.lessonIcon} ${styles.upcoming}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <circle cx="12" cy="12" r="8" />
      </svg>
    </span>
  );
}

export function Sidebar({ modules, courseTitle, currentLessonId, onLessonClick }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id)) // All expanded by default
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (onLessonClick) {
      onLessonClick(lesson.id);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>{courseTitle}</h2>
      </div>
      <ul className={styles.moduleList}>
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const completedCount = module.lessons.filter(l => l.status === 'completed').length;

          return (
            <li key={module.id} className={styles.module}>
              <button
                className={styles.moduleHeader}
                onClick={() => toggleModule(module.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.moduleInfo}>
                  <span className={styles.moduleNumber}>Module {moduleIndex + 1}</span>
                  <span className={styles.moduleTitle}>{module.title}</span>
                </div>
                <svg
                  className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="20"
                  height="20"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isExpanded && (
                <ul className={styles.lessonList}>
                  {module.lessons.map((lesson) => {
                    const isActive = currentLessonId === lesson.id;

                    return (
                      <li
                        key={lesson.id}
                        className={`${styles.lesson} ${isActive ? styles.active : ''} ${lesson.status === 'completed' ? styles.completed : ''}`}
                        onClick={() => handleLessonClick(lesson)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleLessonClick(lesson);
                          }
                        }}
                      >
                        <LessonIcon status={lesson.status} isActive={isActive} />
                        <div className={styles.lessonContent}>
                          <div className={styles.lessonTitle}>{lesson.title}</div>
                          <div className={styles.lessonMeta}>
                            <span className={styles.lessonType}>Video</span>
                            <span className={styles.lessonDot}>•</span>
                            <span className={styles.lessonDuration}>{lesson.duration}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
