'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

interface UploadButtonProps {
  onUpload: (filePath: string) => void;
  accept?: string;
  children: React.ReactNode;
}

export function UploadButton({ onUpload, accept, children }: UploadButtonProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onUpload(result.path);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={isUploading}
      />
      <span className={isUploading ? 'opacity-50 cursor-not-allowed' : ''}>
        {isUploading ? t('common.loading') : children}
      </span>
    </label>
  );
}