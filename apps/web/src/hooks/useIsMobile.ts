/**
 * Mobile detection hook
 * Detects if the current screen size is mobile (< 768px)
 * Uses window.innerWidth and resize listener for responsive updates
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current screen size is mobile
 * @returns boolean indicating if the screen is mobile size
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if screen is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};
