import React from 'react';
import { motion } from 'framer-motion';

interface IconSquaresProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function IconSquares({
  size = 12,
  className = '',
  animated = false,
}: IconSquaresProps) {
  const gap = 2; // Gap between squares
  const totalHeight = size * 3 + gap * 2; // 3 squares + 2 gaps
  
  const squares = [
    { delay: 0, y: 0 },
    { delay: 0.2, y: size + gap },
    { delay: 0.4, y: (size + gap) * 2 },
  ];

  // Dynamic viewBox based on size
  const viewBox = `0 0 ${size} ${totalHeight}`;

  if (animated) {
    return (
      <svg
        width={size}
        height={totalHeight}
        viewBox={viewBox}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {squares.map((square, index) => (
          <motion.rect
            key={index}
            x="0"
            y={square.y}
            width={size}
            height={size}
            fill="currentColor"
            className="text-black dark:text-white"
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: square.delay,
            }}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={totalHeight}
      viewBox={viewBox}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {squares.map((square, index) => (
        <rect
          key={index}
          x="0"
          y={square.y}
          width={size}
          height={size}
          fill="currentColor"
          className="text-black dark:text-white"
        />
      ))}
    </svg>
  );
}

