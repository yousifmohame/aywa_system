'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

export default function EvaluationDatePicker({ defaultDate }: { defaultDate: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    
    // إنشاء بارامترات جديدة للرابط
    const params = new URLSearchParams(searchParams)
    params.set('date', newDate)

    // تحديث الرابط (سيقوم السيرفر بإعادة جلب البيانات تلقائياً)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
      <Calendar size={18} className="text-gray-400" />
      <input 
        type="date" 
        defaultValue={defaultDate}
        onChange={handleDateChange}
        className="text-sm font-bold text-gray-700 outline-none bg-transparent cursor-pointer"
      />
    </div>
  )
}