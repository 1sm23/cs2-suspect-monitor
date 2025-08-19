'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Suspect } from '@/app/lib/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getStatusColor, getStatusText, formatRelativeTime } from '@/app/lib/utils'
import { ExternalLink, Eye, RefreshCw, Trash2 } from 'lucide-react'

interface SuspectCardProps {
  suspect: Suspect
  onUpdate: () => void
}

export function SuspectCard({ suspect, onUpdate }: SuspectCardProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch(`/api/suspects/${suspect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: true })
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to refresh suspect:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个嫌疑人吗？')) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/suspects/${suspect.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete suspect:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            {suspect.avatar_url ? (
              <Image
                src={suspect.avatar_url}
                alt={suspect.nickname || 'Avatar'}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {suspect.nickname?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(suspect.status)}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {suspect.nickname || 'Unknown'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {suspect.steam_id}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">
                {getStatusText(suspect.status)}
              </Badge>
              {suspect.is_playing_cs2 && (
                <Badge variant="destructive">CS2</Badge>
              )}
            </div>
          </div>
        </div>
        
        {suspect.last_checked && (
          <p className="text-xs text-muted-foreground mt-3">
            最后检查: {formatRelativeTime(suspect.last_checked)}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center space-x-2">
        <Link href={`/suspects/${suspect.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            查看详情
          </Button>
        </Link>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
        
        {suspect.profile_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(suspect.profile_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}