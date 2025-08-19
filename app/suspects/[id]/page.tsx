import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SuspectDetail } from '@/app/components/SuspectDetail'

interface SuspectPageProps {
  params: { id: string }
}

async function getSuspect(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/suspects/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Failed to fetch suspect:', error)
    return null
  }
}

export default async function SuspectPage({ params }: SuspectPageProps) {
  const suspect = await getSuspect(params.id)
  
  if (!suspect) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">嫌疑人详情</h1>
          <p className="text-muted-foreground">
            查看详细信息和证据记录
          </p>
        </div>
      </div>
      
      <SuspectDetail suspect={suspect} />
    </div>
  )
}