import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { matchFaces } from '@/utils/faceMatching';

interface FaceMatchStepProps {
  passportImage: string | null;
  faceImage: string | null;
  onMatched: (score: number) => void;
  error: string | null;
}

export function FaceMatchStep({ passportImage, faceImage, onMatched, error }: FaceMatchStepProps) {
  const [matching, setMatching] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!passportImage || !faceImage || matching) return;

    const performMatching = async () => {
      setMatching(true);
      try {
        // Extract passport photo from full passport image
        // The passport photo is typically in the upper portion
        const passportPhoto = await extractPassportPhoto(passportImage);
        
        const result = await matchFaces(passportPhoto, faceImage);
        setScore(result.score);
        
        setTimeout(() => {
          onMatched(result.score);
          setMatching(false);
        }, 1500); // Show result briefly before proceeding
      } catch (err) {
        console.error('[FaceMatchStep] Matching error:', err);
        setMatching(false);
      }
    };

    performMatching();
  }, [passportImage, faceImage, onMatched, matching]);

  // Extract passport photo from full passport image
  const extractPassportPhoto = async (fullImageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = Math.floor(img.height * 0.4); // Upper 40% typically contains photo
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, canvas.height, 0, 0, img.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          resolve(fullImageSrc); // Fallback to full image
        }
      };
      img.src = fullImageSrc;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          Face Verification
        </h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Comparing your face with the passport photo
        </p>
      </div>

      {matching ? (
        <div className="py-6 sm:py-8 space-y-3">
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-black dark:border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-center text-black/70 dark:text-white/70">
            Analyzing facial features...
          </p>
        </div>
      ) : score !== null ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                score >= 0.7
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="sm:w-12 sm:h-12">
                {score >= 0.7 ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                )}
              </svg>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-2">
              {score >= 0.7 ? 'Face Match Verified' : 'Face Match Failed'}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5">
              <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">
                Similarity Score:
              </span>
              <span
                className={`text-base sm:text-lg font-bold ${
                  score >= 0.7
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {(score * 100).toFixed(1)}%
              </span>
            </div>
            {score < 0.7 && (
              <p className="mt-3 text-xs sm:text-sm text-red-600 dark:text-red-400">
                Minimum required: 70%. Please try again with better lighting.
              </p>
            )}
          </div>
        </motion.div>
      ) : null}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-lg p-3 border border-red-500/50"
        >
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

