'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth-manager';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 检查认证状态并重定向
    if (authManager.isAuthenticated()) {
      router.push('/suspects');
    } else {
      router.push('/login');
    }
  }, [router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
