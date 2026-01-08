import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

export function Input({
  label,
  type = 'text',
  placeholder,
  disabled = false,
  value,
  onChange,
  id,
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={styles.input}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
