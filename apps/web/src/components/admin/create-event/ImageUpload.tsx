'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  accept?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  accept = ['image/png', 'image/jpeg', 'image/webp'],
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = accept.map(type => {
    const ext = type.split('/')[1];
    return `.${ext}`;
  }).join(',');

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!accept.includes(file.type)) {
      toast.error(`Invalid file type. Please upload ${accept.map(t => t.split('/')[1].toUpperCase()).join(', ')} files.`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to server
      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      onChange(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Area */}
      {!value ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-colors w-32 h-32',
            uploading
              ? 'border-admin-primary-400 bg-admin-primary-50 dark:bg-admin-primary-900/10'
              : 'border-sabi-border dark:border-sabi-border-dark hover:border-admin-primary-400 dark:hover:border-admin-primary-600',
            'cursor-pointer'
          )}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptString}
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            disabled={uploading}
          />

          <div className="p-4 text-center">
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="w-6 h-6 mx-auto text-admin-primary-500 animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                    Uploading...
                  </p>
                  <div className="max-w-24 mx-auto">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-admin-primary-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark mt-1">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                    Upload image
                  </p>
                  <p className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                    PNG, JPG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Image Preview */
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden border border-sabi-border dark:border-sabi-border-dark w-32 h-32">
            <img
              src={value}
              alt="Event cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
            <div className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Uploaded</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 dark:text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
        Upload a cover image for your event (up to {maxSizeMB}MB).
      </p>
    </div>
  );
}

