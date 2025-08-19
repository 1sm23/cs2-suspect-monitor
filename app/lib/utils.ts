import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now.getTime() - target.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInHours < 24) return `${diffInHours}小时前`
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return formatDate(date)
}

export function isValidSteamId(steamId: string): boolean {
  // Steam 64-bit ID should be a 17-digit number starting with 7656119
  const steamIdRegex = /^7656119\d{10}$/
  return steamIdRegex.test(steamId)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'in-game':
      return 'bg-blue-500'
    case 'away':
      return 'bg-yellow-500'
    case 'busy':
      return 'bg-red-500'
    case 'offline':
    default:
      return 'bg-gray-500'
  }
}

export function getStatusText(status?: string): string {
  switch (status) {
    case 'online':
      return '在线'
    case 'in-game':
      return '游戏中'
    case 'away':
      return '离开'
    case 'busy':
      return '忙碌'
    case 'offline':
    default:
      return '离线'
  }
}

export function getEvidenceTypeText(type: string): string {
  switch (type) {
    case 'text':
      return '文字描述'
    case 'link':
      return '链接'
    case 'video':
      return '视频'
    case 'image':
      return '图片'
    default:
      return '未知'
  }
}

export function getImportanceText(importance: number): string {
  switch (importance) {
    case 1:
      return '低'
    case 2:
      return '较低'
    case 3:
      return '中等'
    case 4:
      return '高'
    case 5:
      return '极高'
    default:
      return '未知'
  }
}

export function getImportanceColor(importance: number): string {
  switch (importance) {
    case 1:
      return 'text-gray-500'
    case 2:
      return 'text-blue-500'
    case 3:
      return 'text-yellow-500'
    case 4:
      return 'text-orange-500'
    case 5:
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}