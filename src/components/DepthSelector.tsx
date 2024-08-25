// components/DepthSelector.tsx

import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepthSelectorProps {
  maxDepth: number;
  currentDepth: number;
  onDepthChange: (depth: number) => void;
  darkMode: boolean;
}

const DepthSelector: React.FC<DepthSelectorProps> = ({ 
  maxDepth, 
  currentDepth, 
  onDepthChange,
  darkMode
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const decreaseDepth = () => {
    if (currentDepth > 1) {
      onDepthChange(currentDepth - 1);
    }
  };

  const increaseDepth = () => {
    if (currentDepth < maxDepth) {
      onDepthChange(currentDepth + 1);
    }
  };

  const arrowClasses = `h-6 w-6 cursor-pointer transition-colors duration-200 ${
    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
  }`;

  return (
    <div className={`flex items-center justify-center space-x-4 ${darkMode ? 'text-white' : 'text-black'}`}>
      <ChevronLeft
        className={`${arrowClasses} ${currentDepth === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={decreaseDepth}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={currentDepth}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-medium"
        >
          Depth: {currentDepth} / {maxDepth}
        </motion.span>
      </AnimatePresence>
      <ChevronRight
        className={`${arrowClasses} ${currentDepth === maxDepth ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={increaseDepth}
      />
    </div>
  );
};

export default DepthSelector;