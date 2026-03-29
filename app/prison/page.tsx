'use client'

import { useState } from 'react'
import { submitComplaintAction } from '@/app/actions/complaints'
import { ChevronDown, Upload, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'

export default function PrisonComplaintPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{success?: boolean, error?: string} | null>(null)
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFileNames(Array.from(e.target.files).map(f => f.name))
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

  if (result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-10 rounded-2xl shadow-md border-t-4 border-t-slate-700 max-w-lg w-full text-center space-y-6">

          <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            تم استلام بلاغك بنجاح
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            شكراً لك. سيتم مراجعة الطلب من الجهات المختصة والتواصل معك في أقرب وقت ممكن.
          </p>

          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-slate-700 text-white font-semibold py-3.5 rounded-lg hover:bg-slate-800 transition"
          >
            إرسال بلاغ جديد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <ShieldCheck className="mx-auto text-slate-700 mb-4" size={56} />

          <h1 className="text-3xl font-bold text-gray-900">
            بوابة بلاغات نزيل السجن
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            يرجى إدخال البيانات المطلوبة بدقة لضمان سرعة معالجة الطلب
          </p>
        </div>

        <form action={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 border-t-4 border-t-slate-700 p-8 sm:p-10 space-y-6">

          {result?.error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 text-sm font-medium border border-red-100">
              <AlertCircle size={18} /> {result.error}
            </div>
          )}

          <input type="hidden" name="sourceSystem" value="prison_nazeel" />

          {/* SELECTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                نوع البلاغ <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select name="submissionType" required className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition">
                  <option value="">--تحديد--</option>
                  <option value="شكوى">شكوى</option>
                  <option value="طلب">طلب</option>
                </select>

                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                الخدمة <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select name="serviceType" required className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition">
                  <option value="">--تحديد--</option>
                  <option value="لم يتم استلام الطلب">لم يتم استلام الطلب</option>
                  <option value="تم استلام الطلب ناقص">تم استلام الطلب ناقص</option>
                  <option value="شكوى لاسترداد المبلغ">شكوى لاسترداد المبلغ</option>
                  <option value="اواجه مشكلة آخرى">اواجه مشكلة آخرى</option>
                </select>

                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                رقم الطلب
              </label>

              <input type="text" name="orderNumber" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                نوع العميل <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select name="clientType" required className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition">
                  <option value="">--تحديد--</option>
                  <option value="فرد">فرد</option>
                  <option value="شركة">شركة</option>
                  <option value="مؤسسة">مؤسسة</option>
                </select>

                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* INPUT */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>

            <input type="text" name="clientName" required className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition" />
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                رقم الجوال <span className="text-red-500">*</span>
              </label>

              <input type="tel" name="phone" dir="ltr" required className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>

              <input type="email" name="email" dir="ltr" required className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition" />
            </div>
          </div>

          {/* TEXTAREA */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              التفاصيل
            </label>

            <textarea rows={5} name="content" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600 transition resize-none"></textarea>
          </div>

          {/* FILE */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              المرفقات
            </label>

            <label className="block group">
              <input type="file" name="files" multiple className="hidden" onChange={handleFileChange} />

              <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                selectedFileNames.length > 0 
                ? 'border-slate-500 bg-slate-50' 
                : 'border-gray-300 hover:border-slate-500 hover:bg-slate-50/40'
              }`}>

                <Upload className={`mx-auto mb-3 ${
                  selectedFileNames.length > 0 
                  ? 'text-slate-700' 
                  : 'text-gray-400 group-hover:text-slate-600'
                }`} size={36} />

                {selectedFileNames.length > 0 ? (
                  <p className="text-sm font-semibold text-slate-700">
                    تم إرفاق {selectedFileNames.length} ملفات
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 font-medium">
                      اضغط هنا لإرفاق المستندات الرسمية
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      الصور و PDF فقط
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* BUTTON */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-slate-700 text-white font-semibold text-lg py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg transition disabled:opacity-70"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
          </button>
        </form>
      </div>
    </div>
  )
}