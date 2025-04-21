'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import styles from '../styles/Timeline.module.css';
import Box from '@mui/material/Box'
import VerticalLayoutTextboxSearch from '@/@components/layout/VerticalLayoutTextboxSearch';
const timelineData = [
  { title: 'Start Project', icon: '🚀', description: 'Kickoff the build.' },
  { title: 'Design', icon: '🎨', description: 'Wireframes and UI/UX.' },
  { title: 'Development', icon: '💻', description: 'Code and components.' },
  { title: 'Testing', icon: '🧪', description: 'QA and bug squashing.' },
  { title: 'Launch', icon: '🚢', description: 'Deploy to production.' },
];

export default function HorizontalTimeline() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update the progress bar
  const updateProgress = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>
    <div className={styles.timelineWrapper}>
      <div className={styles.timelineTrack}>
        {timelineData.map((item, index) => (
          <TimelineItem
            key={index}
            index={index}
            {...item}
            onInView={updateProgress}
          />
        ))}
      </div>
      {/* Progress Bar */}
      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${((currentIndex + 1) / timelineData.length) * 100}%` }}
        />
      </div>
    </div>
    </VerticalLayoutTextboxSearch>
  );
}

function TimelineItem({
  title,
  icon,
  description,
  index,
  onInView,
}: any) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      onInView(index); // Update progress when in view
    }
  }, [inView, index, onInView]);

  return (
    <motion.div
      ref={ref}
      className={`${styles.timelineItem} ${inView ? styles.active : ''}`}
      initial={{ opacity: 0, x: 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
