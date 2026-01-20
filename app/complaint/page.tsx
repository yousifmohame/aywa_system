'use client'

import { useState } from 'react'
import { submitComplaintAction } from '@/app/actions/complaints'
import { 
  ChevronDown, 
  Upload, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function ComplaintPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{success?: boolean, error?: string} | null>(null)

  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map(f => f.name)
      setSelectedFileNames(names)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    const res = await submitComplaintAction(formData)
    setIsSubmitting(false)
    
    if (res.success) {
      setResult({ success: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setResult({ error: res.error })
    }
  }

  // شاشة النجاح
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">تم استلام طلبك بنجاح</h2>
          <p className="text-gray-600 leading-relaxed">
            شكراً لتواصلك معنا. رقم تذكرتك محفوظ لدينا وسيتم مراجعة طلبك والرد عليك عبر البريد الإلكتروني أو الهاتف في أقرب وقت.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-cyan-500 text-white font-bold py-3.5 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            إرسال طلب جديد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-xl mx-auto">
        
      
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ارفق البلاغ</h1>

        <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          
          {/* رسالة الخطأ */}
          {result?.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} /> {result.error}
            </div>
          )}

          {/* نوع العميل (المقصود نوع البلاغ حسب الخيارات) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              نوع البلاغ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                name="submissionType"
                required
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow"
              >
                <option value="">--تحديد--</option>
                <option value="شكوى">شكوى</option>
                <option value="طلب">طلب</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* الخدمة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الخدمة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                name="serviceType"
                required
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow"
              >
                <option value="">--تحديد--</option>
                <option value="لم يتم استلام الطلب">لم يتم استلام الطلب</option>
                <option value="تم استلام الطلب ناقص">تم استلام الطلب ناقص</option>
                <option value="شكوى لاسترداد المبلغ">شكوى لاسترداد المبلغ</option>
                <option value="اواجه مشكلة آخرى">اواجه مشكلة آخرى</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* رقم الطلب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">رقم الطلب</label>
            <input 
              type="text" 
              name="orderNumber"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow" 
            />
          </div>

          {/* نوع العميل (الكيان) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              نوع العميل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                name="clientType"
                required
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow"
              >
                <option value="">--تحديد--</option>
                <option value="فرد">فرد</option>
                <option value="شركة">شركة</option>
                <option value="مؤسسة">مؤسسة</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* الاسم الكامل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="clientName"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow" 
            />
          </div>

          {/* رقم الجوال */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              رقم الجوال <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              name="phone"
              dir="ltr"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow text-right placeholder:text-left" 
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              dir="ltr"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-shadow text-right placeholder:text-left" 
            />
          </div>

          {/* التفاصيل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">التفاصيل</label>
            <textarea 
              rows={5} 
              name="content"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none transition-shadow"
            ></textarea>
          </div>

          {/* المرفقات (شكل فقط حالياً) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">المرفقات</label>
            <label className="block group">
              {/* تمت إضافة name="files" و onChange */}
              <input 
                type="file" 
                name="files" 
                multiple 
                accept="image/*,.pdf,.doc,.docx" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group-hover:shadow-sm ${selectedFileNames.length > 0 ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'}`}>
                <Upload className={`mx-auto mb-3 transition-transform group-hover:scale-110 ${selectedFileNames.length > 0 ? 'text-cyan-600' : 'text-cyan-500'}`} size={32} />
                
                {selectedFileNames.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-cyan-700">تم اختيار {selectedFileNames.length} ملفات</p>
                    <ul className="text-xs text-gray-600">
                      {selectedFileNames.map((name, idx) => (
                        <li key={idx} className="flex items-center justify-center gap-1">
                          <FileText size={10} /> {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 font-medium">اضغط هنا لرفع الملفات أو قم بسحبها وإفلاتها</p>
                    <p className="text-xs text-gray-400 mt-1">يسمح بملفات الصور و PDF</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-500 text-white font-bold py-3.5 rounded-lg hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'الإرسال'}
          </button>

        </form>
      </div>
    </div>
  )
}