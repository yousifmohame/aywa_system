// src/app/page.tsx
'use client'

import { loginAction } from './actions/auth'
import { useActionState } from 'react' // تحديث الاستيراد هنا
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  // استخدام الاسم الجديد useActionState
  // isPending: مفيد لمعرفة ما إذا كان الطلب قيد المعالجة لتعطيل الزر
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-[#0f172a] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-[#0f172a] font-bold text-xl shadow-lg">
              AN
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-sans">مركز موظفي أيوا</h1>
          <p className="text-gray-400 text-sm">نظام إدارة الأداء الداخلي</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form action={action} className="space-y-6">
            
            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                {state.error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left"
                placeholder="manager@aiwa.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isPending} // تعطيل الزر أثناء التحميل
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
                isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-blue-900'
              }`}
            >
              <LogIn size={18} />
              {isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">© 2025 Aiwa Nazeel. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  )
}