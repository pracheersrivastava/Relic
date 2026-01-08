import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  showText?: boolean;
}

export function ProgressBar({ progress, showText = true }: ProgressBarProps) {
  const getStatusClass = () => {
    if (progress === 100) return styles.completed;
    if (progress > 0) return styles.inProgress;
    return styles.notStarted;
  };

  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${getStatusClass()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showText && (
        <span className={styles.progressText}>{progress}% complete</span>
      )}
    </div>
  );
}
