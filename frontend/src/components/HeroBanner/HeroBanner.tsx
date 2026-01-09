'use client';

import React, { useState, useEffect } from 'react';
import styles from './HeroBanner.module.css';
import { banners } from '@/data/homepageData';

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.bannerContainer}>
        <div 
          className={styles.bannerTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={styles.banner}
              style={{ 
                backgroundColor: banner.bgColor,
                color: banner.textColor 
              }}
            >
              <div className={styles.bannerContent}>
                <span className={styles.bannerBrand}>{banner.title}</span>
                <h2 className={styles.bannerTitle}>{banner.subtitle}</h2>
                <p className={styles.bannerDescription}>{banner.description}</p>
                <button 
                  className={styles.bannerCta}
                  style={{ 
                    backgroundColor: banner.textColor,
                    color: banner.bgColor 
                  }}
                >
                  {banner.ctaText} →
                </button>
              </div>
              <div className={styles.bannerGraphic}>
                <div className={styles.decorCircle1}></div>
                <div className={styles.decorCircle2}></div>
                <div className={styles.decorCircle3}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.indicators}>
        {banners.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
