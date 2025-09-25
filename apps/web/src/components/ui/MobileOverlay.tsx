/**
 * Mobile Overlay Component
 * Simple backdrop overlay for mobile sidebar
 * Provides click-outside-to-close functionality
 */

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Mobile overlay backdrop component
 * @param props - Component props
 * @returns JSX element
 */
export const MobileOverlay = ({ 
  isOpen, 
  onClose, 
  className = "" 
}: MobileOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${className}`}
      onClick={onClose}
      aria-hidden="true"
    />
  );
};
