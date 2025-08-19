import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AddSuspectForm } from '@/app/components/AddSuspectForm'

export default function AddSuspectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">添加嫌疑人</h1>
          <p className="text-muted-foreground">
            输入 Steam 64位 ID 来添加新的作弊嫌疑人
          </p>
        </div>
      </div>
      
      <AddSuspectForm />
    </div>
  )
}