import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  disabledReason?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  disabledReason,
  fullWidth = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <div>
      <button
        type={type}
        className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
      {disabled && disabledReason && (
        <span className={styles.disabledReason}>{disabledReason}</span>
      )}
    </div>
  );
}
