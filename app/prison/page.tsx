'use client'

import { useState } from 'react'
import { submitComplaintAction } from '@/app/actions/complaints'
import { ChevronDown, Upload, CheckCircle, AlertCircle, FileText, ShieldCheck } from 'lucide-react'

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
    if (res.success) { setResult({ success: true }); window.scrollTo({ top: 0, behavior: 'smooth' }) } 
    else setResult({ error: res.error })
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-t-slate-700 max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} /></div>
          <h2 className="text-2xl font-bold text-gray-800">تم استلام بلاغك بنجاح</h2>
          <p className="text-gray-600 leading-relaxed">شكراً لك. سيتم مراجعة طلبك عبر الجهات المختصة والرد عليك في أقرب وقت ممكن.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-700 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors">إرسال بلاغ جديد</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <ShieldCheck className="mx-auto text-slate-700 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-800">بوابة بلاغات نزيل السجن</h1>
          <p className="text-gray-500 mt-2">يرجى إدخال البيانات المطلوبة بدقة</p>
        </div>

        <form action={handleSubmit} className="bg-white rounded-3xl shadow-lg border-t-4 border-t-slate-700 p-8 sm:p-10 space-y-6">
          {result?.error && <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm font-medium"><AlertCircle size={18} /> {result.error}</div>}
          
          <input type="hidden" name="sourceSystem" value="prison_nazeel" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">نوع البلاغ <span className="text-red-500">*</span></label>
              <div className="relative"><select name="submissionType" required className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"><option value="">--تحديد--</option><option value="شكوى">شكوى</option><option value="طلب">طلب</option></select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">الخدمة <span className="text-red-500">*</span></label>
              <div className="relative"><select name="serviceType" required className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"><option value="">--تحديد--</option><option value="لم يتم استلام الطلب">لم يتم استلام الطلب</option><option value="تم استلام الطلب ناقص">تم استلام الطلب ناقص</option><option value="شكوى لاسترداد المبلغ">شكوى لاسترداد المبلغ</option><option value="اواجه مشكلة آخرى">اواجه مشكلة آخرى</option></select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">رقم الطلب</label>
              <input type="text" name="orderNumber" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">نوع العميل <span className="text-red-500">*</span></label>
              <div className="relative"><select name="clientType" required className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"><option value="">--تحديد--</option><option value="فرد">فرد</option><option value="شركة">شركة</option><option value="مؤسسة">مؤسسة</option></select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} /></div>
            </div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-2 text-right">الاسم الكامل <span className="text-red-500">*</span></label><input type="text" name="clientName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all" /></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-2 text-right">رقم الجوال <span className="text-red-500">*</span></label><input type="tel" name="phone" dir="ltr" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2 text-right">البريد الإلكتروني <span className="text-red-500">*</span></label><input type="email" name="email" dir="ltr" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all" /></div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-2 text-right">التفاصيل</label><textarea rows={5} name="content" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all resize-none"></textarea></div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">المرفقات</label>
            <label className="block group">
              <input type="file" name="files" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${selectedFileNames.length > 0 ? 'border-slate-500 bg-slate-50' : 'border-gray-200 hover:border-slate-500 hover:bg-slate-50/50'}`}>
                <Upload className={`mx-auto mb-3 transition-transform group-hover:scale-110 ${selectedFileNames.length > 0 ? 'text-slate-700' : 'text-gray-400 group-hover:text-slate-600'}`} size={36} />
                {selectedFileNames.length > 0 ? (
                  <div className="space-y-2"><p className="text-sm font-bold text-slate-700">تم إرفاق {selectedFileNames.length} ملفات</p></div>
                ) : (<p className="text-sm text-gray-600 font-medium">اضغط هنا لإرفاق المستندات الرسمية</p>)}
              </div>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-700 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-700/30 transition-all disabled:opacity-70">
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
          </button>
        </form>
      </div>
    </div>
  )
}