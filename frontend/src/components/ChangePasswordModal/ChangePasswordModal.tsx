'use client';

import React, { useState } from 'react';
import styles from './ChangePasswordModal.module.css';
import { api } from '@/lib/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FieldErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    if (!oldPassword) {
      errors.oldPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (oldPassword === newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.changePassword(oldPassword, newPassword);
      
      if (response.success) {
        setSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Auto close after 2 seconds on success
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        // Check if it's a wrong password error
        if (response.message?.toLowerCase().includes('incorrect') || 
            response.message?.toLowerCase().includes('wrong') ||
            response.message?.toLowerCase().includes('invalid')) {
          setFieldErrors({ oldPassword: 'Current password is incorrect' });
        } else {
          setGeneralError(response.message || 'Failed to change password');
        }
      }
    } catch (err) {
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setGeneralError('');
    setSuccess(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // Eye icon components
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change Password</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>Password changed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {generalError && <div className={styles.error}>{generalError}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="oldPassword" className={styles.label}>
                Current Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (fieldErrors.oldPassword) {
                      setFieldErrors(prev => ({ ...prev, oldPassword: undefined }));
                    }
                  }}
                  className={`${styles.input} ${fieldErrors.oldPassword ? styles.inputError : ''}`}
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.oldPassword && (
                <span className={styles.fieldError}>{fieldErrors.oldPassword}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) {
                      setFieldErrors(prev => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  className={`${styles.input} ${fieldErrors.newPassword ? styles.inputError : ''}`}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <span className={styles.fieldError}>{fieldErrors.newPassword}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm New Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
