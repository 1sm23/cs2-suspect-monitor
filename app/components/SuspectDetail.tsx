'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Suspect, Evidence } from '@/app/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getStatusColor, getStatusText, formatRelativeTime } from '@/app/lib/utils'
import { EvidenceList } from './EvidenceList'
import { EvidenceForm } from './EvidenceForm'
import { RefreshCw, ExternalLink, Plus } from 'lucide-react'

interface SuspectDetailProps {
  suspect: Suspect
}

export function SuspectDetail({ suspect: initialSuspect }: SuspectDetailProps) {
  const [suspect, setSuspect] = useState<Suspect>(initialSuspect)
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showAddEvidence, setShowAddEvidence] = useState(false)

  const fetchEvidence = async () => {
    try {
      const response = await fetch(`/api/suspects/${suspect.id}/evidence`)
      if (response.ok) {
        const data = await response.json()
        setEvidence(data)
      }
    } catch (error) {
      console.error('Failed to fetch evidence:', error)
    }
  }

  const refreshSuspect = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/suspects/${suspect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: true })
      })
      if (response.ok) {
        const updatedSuspect = await response.json()
        setSuspect(updatedSuspect)
      }
    } catch (error) {
      console.error('Failed to refresh suspect:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEvidence()
  }, [suspect.id])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Suspect Info */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto relative">
              {suspect.avatar_url ? (
                <Image
                  src={suspect.avatar_url}
                  alt={suspect.nickname || 'Avatar'}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-2xl font-bold">
                  {suspect.nickname?.charAt(0) || '?'}
                </div>
              )}
              <div
                className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-background ${getStatusColor(suspect.status)}`}
              />
            </div>
            <CardTitle className="mt-4">
              {suspect.nickname || 'Unknown Player'}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-mono">
              {suspect.steam_id}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-center space-x-2">
              <Badge variant="outline">
                {getStatusText(suspect.status)}
              </Badge>
              {suspect.is_playing_cs2 && (
                <Badge variant="destructive">CS2</Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">添加时间:</span>
                <span>{formatRelativeTime(suspect.added_at)}</span>
              </div>
              {suspect.last_checked && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最后检查:</span>
                  <span>{formatRelativeTime(suspect.last_checked)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">证据数量:</span>
                <span>{evidence.length}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={refreshSuspect}
                disabled={refreshing}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                刷新状态
              </Button>
              {suspect.profile_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(suspect.profile_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>证据记录</CardTitle>
            <Button onClick={() => setShowAddEvidence(!showAddEvidence)}>
              <Plus className="w-4 h-4 mr-2" />
              添加证据
            </Button>
          </CardHeader>
          <CardContent>
            {showAddEvidence && (
              <div className="mb-6">
                <EvidenceForm
                  suspectId={suspect.id}
                  onSuccess={() => {
                    fetchEvidence()
                    setShowAddEvidence(false)
                  }}
                  onCancel={() => setShowAddEvidence(false)}
                />
              </div>
            )}
            
            <EvidenceList
              evidence={evidence}
              onUpdate={fetchEvidence}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}