'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateComplaintStatusAction } from '@/app/actions/complaints'
import { 
  ArrowRight, FileText, User, Phone, Wrench, 
  Paperclip, MessageSquare, CheckCircle, Save, Info, 
  Download, Image as ImageIcon, File
} from 'lucide-react'

export default function ComplaintDetailsView({ complaint }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // الحالة المحلية للبيانات القابلة للتعديل
  const [status, setStatus] = useState(complaint.status)
  const [note, setNote] = useState(complaint.adminNote || '')

  const handleSave = async () => {
    setLoading(true)
    const res = await updateComplaintStatusAction(complaint.id, status, note)
    setLoading(false)
    
    if (res.success) {
      alert('تم حفظ التحديثات بنجاح ✅')
      router.refresh()
    } else {
      alert('حدث خطأ أثناء الحفظ ❌')
    }
  }

  // تنسيق التاريخ والوقت
  const dateObj = new Date(complaint.createdAt)
  const dateStr = dateObj.toLocaleDateString('en-CA')
  const timeStr = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

  const statuses = [
    { value: 'PENDING', label: 'جديد / انتظار' },
    { value: 'IN_PROGRESS', label: 'قيد المعالجة' },
    { value: 'SOLVED', label: 'تم الحل' },
    { value: 'CLOSED', label: 'مغلق' },
  ]

  const getStatusButtonClass = (btnValue: string) => {
    const isActive = status === btnValue
    if (isActive) {
      if (btnValue === 'SOLVED') return 'bg-green-100 text-green-700 border-green-200 shadow-sm'
      if (btnValue === 'CLOSED') return 'bg-gray-100 text-gray-700 border-gray-200 shadow-sm'
      return 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
    }
    return 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
  }

  return (
    <main className="flex-1 p-3 overflow-y-auto font-[Tajawal]" dir="rtl">
      <div className="space-y-3 max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
            >
              <ArrowRight size={16} /> العودة
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-600" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800">تفاصيل الشكوى</h1>
                <p className="text-[10px] text-gray-500 font-mono">#{complaint.orderNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Client Info */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User size={14} className="text-blue-600" />
            معلومات العميل
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">اسم العميل</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <User size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800">{complaint.clientName}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">رقم الجوال</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Phone size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800 font-mono" dir="ltr">{complaint.phone}</span>
              </div>
            </div>
            {complaint.email && (
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">البريد الإلكتروني</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-800 font-mono">{complaint.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Complaint Details */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FileText size={14} className="text-blue-600" />
            تفاصيل الشكوى
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">نوع البلاغ</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-800">{complaint.submissionType}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">نوع الخدمة</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Wrench size={12} className="text-gray-400" />
                <span className="text-xs text-gray-800">{complaint.serviceType}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1 font-medium">التفاصيل</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.content || 'لا توجد تفاصيل إضافية.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">التاريخ</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-800 font-mono">{dateStr}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1 font-medium">الوقت</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-800 font-mono">{timeStr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Attachments (Updated Section) */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Paperclip size={14} className="text-blue-600" />
            المرفقات ({complaint.attachments ? complaint.attachments.length : 0})
          </h2>
          
          {complaint.attachments && complaint.attachments.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {complaint.attachments.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* اختيار الأيقونة حسب نوع الملف */}
                    {file.fileType.includes('image') ? (
                      <ImageIcon size={16} className="text-purple-500" />
                    ) : (
                      <File size={16} className="text-blue-500" />
                    )}
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-700 truncate block max-w-[200px]" title={file.fileName}>
                        {file.fileName}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <a 
                    href={file.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-white border border-blue-200 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Download size={12} /> عرض الملف
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <p className="text-[10px] text-gray-400">لا توجد مرفقات مع هذا البلاغ</p>
            </div>
          )}
        </div>

        {/* 4. Employee Notes */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <MessageSquare size={14} className="text-blue-600" />
            ملاحظات الموظف / الحل
          </h2>
          <textarea 
            placeholder="أضف ملاحظاتك أو تفاصيل الحل هنا..." 
            rows={4} 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        {/* 5. Status Actions */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <CheckCircle size={14} className="text-blue-600" />
            حالة البلاغ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${getStatusButtonClass(s.value)}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
             'جاري الحفظ...'
          ) : (
            <>
              <Save size={18} /> حفظ التحديثات
            </>
          )}
        </button>

        {/* Alert Footer */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-blue-900 mb-1">تنبيه</h3>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                عند تحديث حالة الشكوى، سيتم حفظ الملاحظات في النظام. يرجى التأكد من كتابة الحل بشكل واضح قبل تغيير الحالة إلى "تم الحل".
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}