'use client'

import { useState } from 'react'
import { Evidence } from '@/app/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getEvidenceTypeText, 
  getImportanceText, 
  getImportanceColor, 
  formatRelativeTime,
  validateUrl 
} from '@/app/lib/utils'
import { 
  FileText, 
  Link as LinkIcon, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Edit,
  ExternalLink 
} from 'lucide-react'

interface EvidenceListProps {
  evidence: Evidence[]
  onUpdate: () => void
}

interface EvidenceItemProps {
  evidence: Evidence
  onUpdate: () => void
}

function EvidenceItem({ evidence, onUpdate }: EvidenceItemProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('确定要删除这条证据吗？')) return
    
    setDeleting(true)
    try {
      const response = await fetch(
        `/api/suspects/${evidence.suspect_id}/evidence?evidenceId=${evidence.id}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete evidence:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />
      case 'link':
        return <LinkIcon className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const renderContent = () => {
    if (evidence.type === 'link' && validateUrl(evidence.content)) {
      return (
        <div className="space-y-2">
          <a
            href={evidence.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all flex items-center"
          >
            {evidence.content}
            <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
          </a>
          {evidence.description && (
            <p className="text-sm text-muted-foreground">{evidence.description}</p>
          )}
        </div>
      )
    }

    if (evidence.type === 'video' && evidence.content.includes('youtube.com')) {
      const videoId = evidence.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      if (videoId) {
        return (
          <div className="space-y-2">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full rounded-md"
                allowFullScreen
              />
            </div>
            {evidence.description && (
              <p className="text-sm text-muted-foreground">{evidence.description}</p>
            )}
          </div>
        )
      }
    }

    return (
      <div className="space-y-2">
        <p className="break-words">{evidence.content}</p>
        {evidence.description && (
          <p className="text-sm text-muted-foreground">{evidence.description}</p>
        )}
      </div>
    )
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon(evidence.type)}
            <Badge variant="outline">
              {getEvidenceTypeText(evidence.type)}
            </Badge>
            <Badge 
              variant="secondary" 
              className={getImportanceColor(evidence.importance)}
            >
              重要性: {getImportanceText(evidence.importance)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {renderContent()}
        
        <div className="mt-3 text-xs text-muted-foreground">
          添加时间: {formatRelativeTime(evidence.created_at)}
        </div>
      </CardContent>
    </Card>
  )
}

export function EvidenceList({ evidence, onUpdate }: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">还没有添加任何证据</p>
      </div>
    )
  }

  // Sort by importance (desc) then by created_at (desc)
  const sortedEvidence = [...evidence].sort((a, b) => {
    if (a.importance !== b.importance) {
      return b.importance - a.importance
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedEvidence.map((item) => (
        <EvidenceItem
          key={item.id}
          evidence={item}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}