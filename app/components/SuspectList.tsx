'use client'

import { useState, useEffect } from 'react'
import { Suspect } from '@/app/lib/types'
import { SuspectCard } from './SuspectCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw } from 'lucide-react'

export function SuspectList() {
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchSuspects = async () => {
    try {
      const response = await fetch('/api/suspects')
      if (response.ok) {
        const data = await response.json()
        setSuspects(data)
      }
    } catch (error) {
      console.error('Failed to fetch suspects:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSuspects()
  }

  useEffect(() => {
    fetchSuspects()
  }, [])

  const filteredSuspects = suspects.filter(suspect =>
    suspect.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suspect.steam_id.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索嫌疑人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {filteredSuspects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的嫌疑人' : '还没有添加任何嫌疑人'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuspects.map((suspect) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              onUpdate={fetchSuspects}
            />
          ))}
        </div>
      )}
    </div>
  )
}