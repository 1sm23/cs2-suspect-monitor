'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { NavigationBar } from '@/app/components/NavigationBar';
import { StatusBadge } from '@/app/components/StatusBadge';
import { EvidenceList } from '@/app/components/EvidenceList';
import { EvidenceForm } from '@/app/components/EvidenceForm';
import { StatusHistoryTimeline } from '@/app/components/StatusHistoryTimeline';
import { PollingRefreshControl } from '@/app/components/PollingRefreshControl';
import { useLanguage } from '@/app/components/LanguageProvider';
import { Suspect, Evidence, SuspectStatusHistory } from '@/lib/types';

export default function SuspectDetailPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [history, setHistory] = useState<SuspectStatusHistory[]>([]);
  const [activeTab, setActiveTab] = useState('evidence');
  const [isLoading, setIsLoading] = useState(true);

  const suspectId = parseInt(params.id as string);

  const fetchSuspect = async () => {
    try {
      const response = await fetch(`/api/suspects/${suspectId}`);
      if (response.ok) {
        const data = await response.json();
        setSuspect(data);
      }
    } catch (error) {
      console.error('Error fetching suspect:', error);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await fetch(`/api/suspects/${suspectId}/evidence`);
      if (response.ok) {
        const data = await response.json();
        setEvidence(data);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/suspects/${suspectId}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetch('/api/suspects/status/refresh', { method: 'POST' });
      await fetchSuspect();
      await fetchHistory();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    try {
      const response = await fetch(`/api/suspects/${suspectId}/evidence?evidenceId=${evidenceId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEvidence(evidence.filter(e => e.id !== evidenceId));
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
    }
  };

  const handleEvidenceAdded = () => {
    fetchEvidence();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSuspect(), fetchEvidence(), fetchHistory()]);
      setIsLoading(false);
    };
    
    if (suspectId) {
      loadData();
    }
  }, [suspectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-7xl mx-auto py-6 px-4 text-center">
          <div className="text-gray-500">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!suspect) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-7xl mx-auto py-6 px-4 text-center">
          <div className="text-red-500">Suspect not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Suspect Info Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <Image
              src={suspect.avatar_url || '/avatar_placeholder.png'}
              alt={suspect.nickname || suspect.steam_id}
              width={96}
              height={96}
              className="rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {suspect.nickname || 'Unknown Player'}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{suspect.steam_id}</p>
              <div className="flex items-center space-x-4 mt-3">
                <StatusBadge status={suspect.status} />
                {suspect.last_checked && (
                  <span className="text-sm text-gray-500">
                    Last checked: {new Date(suspect.last_checked).toLocaleString()}
                  </span>
                )}
                {suspect.profile_url && (
                  <a
                    href={suspect.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Steam Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Control */}
        <div className="mb-6">
          <PollingRefreshControl onRefresh={handleRefresh} />
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'evidence'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('evidence.title')}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Status History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <EvidenceForm suspectId={suspectId} onSubmit={handleEvidenceAdded} />
                <EvidenceList evidence={evidence} onDelete={handleDeleteEvidence} />
              </div>
            )}

            {activeTab === 'history' && (
              <StatusHistoryTimeline history={history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}