'use client';

import { Evidence } from '@/lib/types';
import { EvidenceItem } from './EvidenceItem';

interface EvidenceListProps {
  evidence: Evidence[];
  onDelete: (id: number) => void;
}

export function EvidenceList({ evidence, onDelete }: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No evidence found</div>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <EvidenceItem key={item.id} evidence={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
