import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SuspectList } from '@/app/components/SuspectList'
import { Plus } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">嫌疑人监控</h1>
          <p className="text-muted-foreground">
            监控 CS2 作弊嫌疑人的在线状态和游戏状态
          </p>
        </div>
        <Link href="/suspects/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加嫌疑人
          </Button>
        </Link>
      </div>
      
      <SuspectList />
    </div>
  )
}