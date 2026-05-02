import React, { useEffect, useState } from 'react';
import useAI from '../../../hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function DialogueBox() {
  const { narration, loading } = useAI();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide the subtitle box completely while loading new text
    if (loading) {
      setVisible(false);
      return;
    }

    // Show subtitles only when we have the final text
    if (narration) {
      setVisible(true);

      // Auto-hide the subtitle after the narrator finishes speaking
      // Calculate dynamic read time: ~280ms per word, with a minimum of 3.5 seconds
      const wordCount = narration.split(' ').length;
      const readTime = Math.max(3500, wordCount * 280);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, readTime);

      return () => clearTimeout(timer);
    }
  }, [narration, loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="subtitle-box"
        >
          <div className="subtitle-text">
            {narration}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}