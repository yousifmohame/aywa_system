'use client'

import { useState } from 'react'
import Link from 'next/link' // 1. استيراد Link
import { updateComplaintStatusAction } from '@/app/actions/complaints'
import { Eye, CheckCircle2 } from 'lucide-react'

export function EmployeeComplaintCard({ item }: any) {
  const [loading, setLoading] = useState(false)

  const handleSolve = async () => {
    if(!confirm('هل أكملت حل هذه المشكلة وتأكدت من رضا العميل؟')) return;
    setLoading(true)
    await updateComplaintStatusAction(item.id, 'SOLVED')
    setLoading(false)
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            {item.clientName}
            {item.status === 'SOLVED' && <CheckCircle2 size={16} className="text-green-500" />}
          </h3>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 mt-1 inline-block font-mono">
            #{item.orderNumber || 'N/A'}
          </span>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2">
        {item.content || 'لا توجد تفاصيل إضافية...'}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center border-t pt-3 mt-2">
        <div className="flex items-center gap-2">
             <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                item.status === 'SOLVED' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-blue-50 text-blue-700 border-blue-100'
             }`}>
                {item.status === 'SOLVED' ? 'مكتملة' : 'قيد التنفيذ'}
            </span>
        </div>

        <div className="flex items-center gap-2">
            {/* 2. زر عرض التفاصيل الجديد */}
            <Link 
                href={`/dashboard/my-complaints/${item.id}`}
                className="flex items-center gap-1 bg-white text-gray-600 border border-gray-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            >
                <Eye size={14} /> التفاصيل
            </Link>

            {/* زر تم الحل (يظهر فقط إذا لم تكن محلولة) */}
            {item.status !== 'SOLVED' && (
            <button 
                onClick={handleSolve}
                disabled={loading}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-70"
            >
                {loading ? '...' : <><CheckCircle2 size={14} /> تم الحل</>}
            </button>
            )}
        </div>
      </div>
    </div>
  )
}