'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { validateUrl } from '@/app/lib/utils'
import { Save, X } from 'lucide-react'

interface EvidenceFormProps {
  suspectId: number
  onSuccess: () => void
  onCancel: () => void
}

export function EvidenceForm({ suspectId, onSuccess, onCancel }: EvidenceFormProps) {
  const [formData, setFormData] = useState({
    type: 'text',
    content: '',
    description: '',
    importance: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.content.trim()) {
      setError('请输入证据内容')
      return
    }

    if (formData.type === 'link' && !validateUrl(formData.content.trim())) {
      setError('请输入有效的链接')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/suspects/${suspectId}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          content: formData.content.trim(),
          description: formData.description.trim() || undefined,
          importance: formData.importance
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || '添加失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">添加证据</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">证据类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文字描述</SelectItem>
                  <SelectItem value="link">链接</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importance">重要性</Label>
              <Select
                value={formData.importance.toString()}
                onValueChange={(value) => setFormData({ ...formData, importance: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">低 (1)</SelectItem>
                  <SelectItem value="2">较低 (2)</SelectItem>
                  <SelectItem value="3">中等 (3)</SelectItem>
                  <SelectItem value="4">高 (4)</SelectItem>
                  <SelectItem value="5">极高 (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              {formData.type === 'text' ? '证据内容' : 
               formData.type === 'link' ? '链接地址' : 
               formData.type === 'video' ? '视频链接' : '图片链接'}
            </Label>
            {formData.type === 'text' ? (
              <Textarea
                id="content"
                placeholder="请详细描述发现的作弊证据..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
                rows={4}
              />
            ) : (
              <Input
                id="content"
                type="url"
                placeholder={
                  formData.type === 'link' ? 'https://example.com/demo.dem' :
                  formData.type === 'video' ? 'https://youtube.com/watch?v=...' :
                  'https://example.com/image.jpg'
                }
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">补充说明 (可选)</Label>
            <Textarea
              id="description"
              placeholder="添加更多说明或背景信息..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存证据'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}