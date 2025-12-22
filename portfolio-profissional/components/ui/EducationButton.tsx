'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface EducationButtonProps {
  onClick: () => void;
  className?: string;
}

export function EducationButton({ onClick, className = '' }: EducationButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        bg-primary text-primary-foreground hover:bg-primary/90 
        px-6 py-3 rounded-lg transition-all duration-200 font-medium 
        relative overflow-hidden group flex items-center gap-2 
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
    >
      <span className="relative z-10 flex items-center gap-2">
        <motion.div
          whileHover={{ 
            rotate: 15,
            transition: { duration: 0.2 }
          }}
        >
          <GraduationCap className="w-4 h-4" />
        </motion.div>
        Formação
      </span>
      
      {/* Gradient overlay effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}