'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateComplaintStatusAction } from '@/app/actions/complaints'
import { Eye, CheckCircle2, MonitorSmartphone } from 'lucide-react'

// دالة لتحديد اسم ولون النظام
const getSystemInfo = (systemCode: string) => {
  switch (systemCode) {
    case 'aywa_nazeel': return { name: 'إيوا نزيل', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'nazeel_store': return { name: 'نزيل ستور', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'prison_nazeel': return { name: 'نزيل السجن', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    case 'liniora': return { name: 'لينيورا', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    default: return { name: 'غير معروف', color: 'bg-gray-50 text-gray-700 border-gray-200' };
  }
}

export function EmployeeComplaintCard({ item }: any) {
  const [loading, setLoading] = useState(false)

  const handleSolve = async () => {
    if(!confirm('هل أكملت حل هذه المشكلة وتأكدت من رضا العميل؟')) return;
    setLoading(true)
    await updateComplaintStatusAction(item.id, 'SOLVED')
    setLoading(false)
  }

  const systemInfo = getSystemInfo(item.sourceSystem);

  return (
    <div className="bg-white p-5 rounded-xl border border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            {item.clientName}
            {item.status === 'SOLVED' && <CheckCircle2 size={16} className="text-green-500" />}
          </h3>
          
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
              #{item.orderNumber || 'N/A'}
            </span>
            {/* شارة النظام المضافة هنا */}
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${systemInfo.color}`}>
              <MonitorSmartphone size={12} /> {systemInfo.name}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">
          {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2 border border-gray-100">
        {item.content || 'لا توجد تفاصيل إضافية...'}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
        <div className="flex items-center gap-2">
             <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                item.status === 'SOLVED' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
             }`}>
                {item.status === 'SOLVED' ? 'مكتملة' : 'قيد التنفيذ'}
            </span>
        </div>

        <div className="flex items-center gap-2">
            <Link 
                href={`/dashboard/my-complaints/${item.id}`}
                className="flex items-center gap-1 bg-white text-gray-600 border border-gray-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            >
                <Eye size={14} /> التفاصيل
            </Link>

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