'use client';

import React from 'react';
import styles from './page.module.css';
import { Navbar, HeroBanner, CourseRow, CategoryCards } from '@/components';
import { 
  trendingCourses, 
  popularCourses, 
  newCourses, 
  aiSkillsCourses,
  partners 
} from '@/data/homepageData';

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      <Navbar />
      
      <main className={styles.main}>
        <HeroBanner />
        
        <CategoryCards />
        
        {/* Partners Section */}
        <section className={styles.partnersSection}>
          <h3 className={styles.partnersTitle}>
            Learn from 350+ leading universities and companies
          </h3>
          <div className={styles.partnersRow}>
            {partners.map((partner) => (
              <div key={partner.name} className={styles.partnerBadge}>
                <span className={styles.partnerLogo}>{partner.logo}</span>
                <span className={styles.partnerName}>{partner.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Course Sections with Auto-Scroll */}
        <section className={styles.courseSections}>
          <h2 className={styles.sectionMainTitle}>Trending courses</h2>
          
          <CourseRow 
            title="Most popular →" 
            courses={trendingCourses} 
            direction="left"
          />
          
          <CourseRow 
            title="Weekly spotlight →" 
            courses={popularCourses} 
            direction="right"
          />
          
          <CourseRow 
            title="In-demand AI skills →" 
            courses={aiSkillsCourses} 
            direction="left"
          />
          
          <CourseRow 
            title="New courses →" 
            courses={newCourses} 
            direction="right"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>Coursera</span>
            <p className={styles.footerTagline}>
              Learn without limits
            </p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Coursera</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Catalog</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Community</h4>
              <a href="#">Learners</a>
              <a href="#">Partners</a>
              <a href="#">Developers</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>More</h4>
              <a href="#">Press</a>
              <a href="#">Contact</a>
              <a href="#">Help</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 Coursera Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

