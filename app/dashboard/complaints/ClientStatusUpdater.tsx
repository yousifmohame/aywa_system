'use client'
import { useState } from 'react'
import { updateComplaintStatusAction } from '@/app/actions/complaints'

export default function ComplaintCard({ item }: any) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatus = async (newStatus: string) => {
    if(!confirm('هل أنت متأكد من تغيير الحالة؟')) return;
    setIsLoading(true)
    await updateComplaintStatusAction(item.id, newStatus)
    setIsLoading(false)
  }

  const statusColors: any = {
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'SOLVED': 'bg-green-100 text-green-700 border-green-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const statusText: any = {
    'PENDING': 'قيد الانتظار',
    'SOLVED': 'تم الحل',
    'CLOSED': 'مغلق',
  }

  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between transition-all hover:shadow-md ${item.status === 'PENDING' ? 'border-r-4 border-r-yellow-400' : ''}`}>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800 text-lg">{item.clientName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
            {statusText[item.status]}
          </span>
          <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
        </div>
        
        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
          {item.content}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mt-1">
          📞 {item.phone}
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-[140px] border-r pr-4 mr-2 md:border-r-0 md:pr-0 md:mr-0 md:border-r-gray-100 md:pr-4">
        <span className="text-xs font-bold text-gray-400 mb-1">الإجراءات</span>
        
        {item.status !== 'SOLVED' && (
          <button 
            onClick={() => handleStatus('SOLVED')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 py-2 px-3 rounded-lg text-sm font-bold transition-colors"
          >
            ✅ تم الحل
          </button>
        )}

        {item.status !== 'CLOSED' && (
          <button 
            onClick={() => handleStatus('CLOSED')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            🔒 إغلاق
          </button>
        )}
        
        {item.status !== 'PENDING' && (
            <button 
            onClick={() => handleStatus('PENDING')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 py-2 px-3 rounded-lg text-xs transition-colors"
          >
            إعادة للانتظار
          </button>
        )}
      </div>
    </div>
  )
}