import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeTyping({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200); // duration of animation
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        key="welcome"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: -20 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
        className="flex items-center justify-center h-screen"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-green-700 font-['Fredoka_One']"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 1.4,
          }}
        >
          Welcome to Moofli Diary
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
