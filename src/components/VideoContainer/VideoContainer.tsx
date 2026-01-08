import React from 'react';
import styles from './VideoContainer.module.css';

interface VideoContainerProps {
  lessonTitle?: string;
}

export function VideoContainer({ lessonTitle }: VideoContainerProps) {
  return (
    <div>
      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          <div className={styles.videoPlaceholder}>
            <div className={styles.placeholderContent}>
              <div className={styles.playIcon}>▶</div>
              {lessonTitle && <span>{lessonTitle}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.videoLabel}>
        🎥 Video playback – Backend pending
      </div>
    </div>
  );
}
