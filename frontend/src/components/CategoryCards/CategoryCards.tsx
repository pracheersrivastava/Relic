'use client';

import React from 'react';
import styles from './CategoryCards.module.css';
import { categories } from '@/data/homepageData';

export const CategoryCards: React.FC = () => {
  return (
    <section className={styles.categorySection}>
      <div className={styles.cardsContainer}>
        {categories.map((category) => (
          <div key={category.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{category.name}</h3>
            <span className={styles.cardIcon}>{category.icon}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
