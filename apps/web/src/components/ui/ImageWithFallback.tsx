'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  fallbackElement?: React.ReactNode;
  priority?: boolean;
  unoptimized?: boolean;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc,
  fallbackElement,
  priority = false,
  unoptimized = false,
  onError,
}: ImageWithFallbackProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const handleError = () => {
    if (!imageFailed) {
      setImageFailed(true);
      onError?.();
    } else if (fallbackSrc && !fallbackFailed) {
      setFallbackFailed(true);
    }
  };

  // If both main image and fallback failed, show fallback element
  if (imageFailed && (fallbackFailed || !fallbackSrc)) {
    return (
      <>
        {fallbackElement || (
          <div
            className={cn(
              'bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
              className
            )}
            style={{ width, height }}
          >
            <span className="text-gray-500 dark:text-gray-400 text-sm">📊</span>
          </div>
        )}
      </>
    );
  }

  return (
    <Image
      src={imageFailed && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
}



