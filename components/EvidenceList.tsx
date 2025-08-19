import { Evidence } from '@/lib/types';
import EvidenceItem from './EvidenceItem';
import { useLanguage, t } from './LanguageProvider';

interface EvidenceListProps {
  evidence: Evidence[];
  onDelete?: (id: string) => void;
}

export default function EvidenceList({ evidence, onDelete }: EvidenceListProps) {
  const { locale } = useLanguage();

  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No evidence found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <EvidenceItem
          key={item.id}
          evidence={item}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}