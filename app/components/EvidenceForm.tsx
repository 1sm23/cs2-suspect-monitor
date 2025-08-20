'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';

interface EvidenceFormProps {
  suspectId: number;
  onSubmit: () => void;
}

export function EvidenceForm({ suspectId, onSubmit }: EvidenceFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch(`/api/suspects/${suspectId}/evidence`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setFormData({
          type: 'text',
          title: '',
          content: '',
          file: null,
        });
        onSubmit();
      } else {
        throw new Error('Failed to add evidence');
      }
    } catch (error) {
      console.error('Error adding evidence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{t('evidence.add_evidence')}</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('evidence.type')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="text">{t('evidence.types.text')}</option>
            <option value="link">{t('evidence.types.link')}</option>
            <option value="video">{t('evidence.types.video')}</option>
            <option value="image">{t('evidence.types.image')}</option>
            <option value="file">{t('evidence.types.file')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('evidence.evidence_title')}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('evidence.content')}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
            required
          />
        </div>

        {['image', 'file', 'video'].includes(formData.type) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('evidence.file')}
            </label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              accept={formData.type === 'image' ? 'image/*' : undefined}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('common.loading') : t('evidence.submit')}
        </button>
      </div>
    </form>
  );
}