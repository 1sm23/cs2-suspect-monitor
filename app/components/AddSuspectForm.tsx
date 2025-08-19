'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidSteamId } from '@/app/lib/utils'
import { Loader2 } from 'lucide-react'

export function AddSuspectForm() {
  const [steamId, setSteamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!steamId.trim()) {
      setError('请输入 Steam ID')
      return
    }

    if (!isValidSteamId(steamId.trim())) {
      setError('请输入有效的 Steam 64位 ID (17位数字，以7656119开头)')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/suspects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steam_id: steamId.trim(),
        }),
      })

      if (response.ok) {
        router.push('/')
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
        <CardTitle>添加新的嫌疑人</CardTitle>
        <CardDescription>
          请输入嫌疑人的 Steam 64位 ID。系统将自动获取玩家信息和当前状态。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="steamId">Steam 64位 ID</Label>
            <Input
              id="steamId"
              type="text"
              placeholder="例如: 76561198000000000"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Steam 64位 ID 是17位数字，以7656119开头。可以在 Steam 个人资料页面或第三方工具中获取。
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? '添加中...' : '添加嫌疑人'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              取消
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-md">
          <h4 className="font-medium mb-2">如何获取 Steam 64位 ID：</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>访问玩家的 Steam 个人资料页面</li>
            <li>复制页面 URL 中的17位数字 ID</li>
            <li>或使用 steamid.io 等工具转换其他格式的 Steam ID</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}