/**
 * Server-side Supabase Storage utilities for event images
 * 
 * This module handles:
 * - Creating and managing the event-images storage bucket
 * - Uploading event images with validation
 * - Generating public URLs for uploaded images
 * 
 * IMPORTANT: This file should only be imported server-side
 */

import { supabaseAdmin } from './supabase-server';

const BUCKET_NAME = 'event-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Ensure the event-images bucket exists with proper configuration
 * Creates the bucket if it doesn't exist, otherwise returns successfully
 */
export async function ensureEventImagesBucket(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket with public access
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }

      console.log(`✅ Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error ensuring event images bucket:', error);
    throw error;
  }
}

/**
 * Generate a safe, unique file path for event images
 */
function generateSafeFilePath(
  originalFilename: string,
  adminUserId: string
): string {
  // Extract extension
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Generate random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  
  // Create safe filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${randomSuffix}.${ext}`;
  
  // Return full path
  return `events/${adminUserId}/${filename}`;
}

/**
 * Upload an event image to Supabase Storage
 * 
 * @param file - The image file to upload
 * @param opts - Upload options including admin user ID
 * @returns Object containing publicUrl and storage path
 */
export async function uploadEventImage(
  file: File,
  opts: { adminUserId: string }
): Promise<{ publicUrl: string; path: string }> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Generate safe path
  const path = generateSafeFilePath(file.name, opts.adminUserId);

  try {
    // Upload file to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return {
      publicUrl: data.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw error;
  }
}

/**
 * Delete an event image from storage
 * 
 * @param path - The storage path to delete
 */
export async function deleteEventImage(path: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting event image:', error);
    throw error;
  }
}

