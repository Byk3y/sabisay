/**
 * useMobileSidebar Hook
 * Handles mobile sidebar state, animations, and interactions
 */

import { useState, useCallback, useEffect } from 'react';
import { useIsMobile } from './useIsMobile';

export interface UseMobileSidebarReturn {
  // State
  isOpen: boolean;
  isAnimating: boolean;
  
  // Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  
  // Handlers
  handleBackdropClick: () => void;
  handleEscapeKey: (event: KeyboardEvent) => void;
}

/**
 * Hook for managing mobile sidebar state and animations
 * @param onClose - Optional callback when sidebar closes
 * @returns Object containing sidebar state and handlers
 */
export const useMobileSidebar = (onClose?: () => void): UseMobileSidebarReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  const openSidebar = useCallback(() => {
    if (!isMobile) return;
    setIsOpen(true);
    setIsAnimating(true);
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = 'hidden';
  }, [isMobile]);

  const closeSidebar = useCallback(() => {
    if (!isOpen) return;
    
    setIsAnimating(true);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    
    // Call optional onClose callback
    onClose?.();
    
    // Delay the actual close to allow animation
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 300); // Match transition duration
  }, [isOpen, onClose]);

  const toggleSidebar = useCallback(() => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }, [isOpen, openSidebar, closeSidebar]);

  const handleBackdropClick = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      closeSidebar();
    }
  }, [isOpen, closeSidebar]);

  // Handle escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
    return undefined;
  }, [isOpen, handleEscapeKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-close on desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      closeSidebar();
    }
  }, [isMobile, isOpen, closeSidebar]);

  return {
    isOpen,
    isAnimating,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    handleBackdropClick,
    handleEscapeKey,
  };
};
