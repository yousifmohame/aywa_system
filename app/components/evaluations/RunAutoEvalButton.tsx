'use client'

import { useState } from 'react'
import { runAutoEvaluationsAction } from '@/app/actions/evaluations'
import { Bot, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RunAutoEvalButton({ dateStr }: { dateStr: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRun = async () => {
    setLoading(true)
    const res = await runAutoEvaluationsAction(dateStr)
    setLoading(false)
    
    if (res.success) {
      alert('تم حساب وتحديث التقييمات بنجاح 🚀')
      router.refresh() // لتحديث الصفحة وإظهار النتائج الجديدة
    } else {
      alert(res.error)
    }
  }

  return (
    <button 
      onClick={handleRun}
      disabled={loading}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-70"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
      {loading ? 'جاري حساب التقييمات...' : 'تشغيل التقييم الذكي (AI)'}
    </button>
  )
}