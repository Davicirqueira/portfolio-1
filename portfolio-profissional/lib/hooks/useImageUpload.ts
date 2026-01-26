import { useState, useCallback } from 'react';

interface UploadOptions {
  category?: 'profile' | 'project' | 'general';
  replaceExisting?: boolean;
  existingFilename?: string;
}

interface UploadResult {
  filename: string;
  url: string;
  category: string;
  size: number;
  type: string;
}

interface UseImageUploadReturn {
  uploadImage: (file: File, options?: UploadOptions) => Promise<string>;
  removeImage: (filename: string, category?: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  clearError: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadImage = useCallback(async (
    file: File, 
    options: UploadOptions = {}
  ): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', options.category || 'general');
      formData.append('replaceExisting', String(options.replaceExisting || false));
      
      if (options.existingFilename) {
        formData.append('existingFilename', options.existingFilename);
      }

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(response.error || `HTTP ${xhr.status}`));
            } catch (e) {
              reject(new Error(`HTTP ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        xhr.open('POST', '/api/admin/media/upload');
        xhr.send(formData);
      });

      const result = await uploadPromise;
      setUploadProgress(100);
      
      return result.url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const removeImage = useCallback(async (
    filename: string, 
    category: string = 'general'
  ): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/media/upload?filename=${encodeURIComponent(filename)}&category=${encodeURIComponent(category)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove image');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadImage,
    removeImage,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
}