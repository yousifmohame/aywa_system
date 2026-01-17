// src/app/page.tsx
'use client'

import { loginAction } from './actions/auth'
import { useActionState } from 'react'
import { LogIn, User } from 'lucide-react'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-[Tajawal]" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-[#0f172a] p-8 text-center relative overflow-hidden">
          {/* زخرفة خلفية بسيطة */}
          <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 opacity-20 transform -skew-y-12 scale-150"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center text-[#0f172a] font-bold text-2xl shadow-lg transform rotate-3">
                AN
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">بوابة الموظف</h1>
            <p className="text-blue-200 text-sm font-medium">مركز أداء الموظفين</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form action={action} className="space-y-5">
            
            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-bold animate-pulse">
                {state.error}
              </div>
            )}

            {/* حقل اسم المستخدم / الإيميل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="email">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="text" // تغييرنا النوع هنا ليقبل أي نص
                  name="email" // نترك الاسم email لأنه ما يتوقعه الـ action
                  id="email"
                  required
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] focus:border-[#0f172a] outline-none transition-all text-left placeholder:text-gray-400 text-sm font-medium"
                  placeholder="username OR user@aiwa.com"
                  dir="ltr"
                  autoComplete="username"
                />
                <User className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="password">
                كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] focus:border-[#0f172a] outline-none transition-all text-left font-medium"
                placeholder="••••••••"
                dir="ltr"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                isPending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#0f172a] hover:bg-blue-900 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPending ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري التحقق...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 py-4 text-center border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400">
            © 2025 Aiwa Nazeel System v1.0
          </p>
        </div>
      </div>
    </div>
  )
}