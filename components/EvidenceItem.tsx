import { Evidence } from '@/lib/types';

interface EvidenceItemProps {
  evidence: Evidence;
  onDelete?: (id: string) => void;
}

export default function EvidenceItem({ evidence, onDelete }: EvidenceItemProps) {
  const formatType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {evidence.title}
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {formatType(evidence.type)}
            </span>
          </div>
          {evidence.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {evidence.description}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Uploaded by {evidence.uploadedBy} on {new Date(evidence.createdAt).toLocaleDateString()}
          </div>
          {evidence.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {evidence.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(evidence.id)}
            className="ml-4 text-red-600 hover:text-red-500 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      {evidence.filePath && (
        <div className="mt-3">
          <a
            href={`/api/files/${evidence.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 text-sm underline"
          >
            View File
          </a>
        </div>
      )}
      {evidence.externalUrl && (
        <div className="mt-3">
          <a
            href={evidence.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 text-sm underline"
          >
            View External Link
          </a>
        </div>
      )}
    </div>
  );
}