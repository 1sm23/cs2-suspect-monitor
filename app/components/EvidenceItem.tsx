'use client';

import { Evidence } from '@/lib/types';
import { useTranslations } from '@/lib/i18n';

interface EvidenceItemProps {
  evidence: Evidence;
  onDelete: (id: number) => void;
}

export function EvidenceItem({ evidence, onDelete }: EvidenceItemProps) {
  const t = useTranslations();

  const handleDelete = () => {
    if (confirm(t('common.confirm'))) {
      onDelete(evidence.id);
    }
  };

  const renderContent = () => {
    switch (evidence.type) {
      case 'link':
        return (
          <a
            href={evidence.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {evidence.content}
          </a>
        );
      case 'image':
        if (evidence.file_path) {
          return (
            <div>
              <img 
                src={evidence.file_path} 
                alt={evidence.title}
                className="max-w-xs max-h-48 object-contain"
              />
              <p className="text-sm text-gray-600 mt-2">{evidence.content}</p>
            </div>
          );
        }
        return <span>{evidence.content}</span>;
      case 'file':
        if (evidence.file_path) {
          return (
            <div>
              <a
                href={evidence.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download File
              </a>
              <p className="text-sm text-gray-600 mt-2">{evidence.content}</p>
            </div>
          );
        }
        return <span>{evidence.content}</span>;
      default:
        return <span>{evidence.content}</span>;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{evidence.title}</h4>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {t((`evidence.types.${evidence.type}`) as any)}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          {t('common.delete')}
        </button>
      </div>
      
      <div className="mt-3">
        {renderContent()}
      </div>
      
      <div className="text-xs text-gray-500 mt-3">
        {new Date(evidence.created_at).toLocaleString()}
      </div>
    </div>
  );
}