'use client'

import { useState, useTransition } from 'react'
import { employeeAttendanceAction } from '@/app/actions/attendance' // الأكشن الذي أنشأناه سابقاً
import { LogIn, LogOut, Clock, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  todayPerf: any // بيانات أداء اليوم
  settings: any  // إعدادات وقت الدوام
}

export default function AttendanceCard({ userId, todayPerf, settings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  const isCheckedIn = !!todayPerf?.checkIn
  const isCheckedOut = !!todayPerf?.checkOut
  
  // دالة التعامل مع الزر
  const handleAttendance = () => {
    setError('')
    startTransition(async () => {
      const result = await employeeAttendanceAction(userId)
      if (result?.error) {
        setError(result.error)
      } else {
        // تحديث الصفحة لعرض البيانات الجديدة
        router.refresh()
      }
    })
  }

  // تنسيق الوقت
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Clock size={18} className="text-blue-600" />
             تسجيل الدوام
           </h3>
           <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
             الدوام: {settings?.workStartTime || '09:00'} - {settings?.workEndTime || '17:00'}
           </span>
        </div>
        
        {/* عرض أوقات الدخول والخروج المسجلة */}
        <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
                <span className="text-gray-500">وقت الحضور:</span>
                <span className="font-bold text-gray-800">
                    {isCheckedIn ? formatTime(todayPerf.checkIn) : '--:--'}
                </span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-500">وقت الانصراف:</span>
                <span className="font-bold text-gray-800">
                    {isCheckedOut ? formatTime(todayPerf.checkOut) : '--:--'}
                </span>
            </div>
        </div>
      </div>

      {/* منطقة الأزرار والرسائل */}
      <div>
        {error && (
            <div className="mb-2 p-2 bg-red-50 text-red-600 text-[10px] rounded flex items-center gap-1 font-bold">
                <AlertCircle size={12} /> {error}
            </div>
        )}

        {isCheckedOut ? (
            <div className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-center text-sm font-bold border border-green-200">
                ✅ تم إنهاء دوام اليوم
            </div>
        ) : (
            <button
                onClick={handleAttendance}
                disabled={isPending}
                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold text-white transition-all ${
                    isCheckedIn 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                } ${isPending ? 'opacity-70 cursor-not-allowed' : 'shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
            >
                {isPending ? 'جاري التسجيل...' : isCheckedIn ? (
                    <> <LogOut size={18} /> تسجيل انصراف </>
                ) : (
                    <> <LogIn size={18} /> تسجيل حضور </>
                )}
            </button>
        )}
      </div>
    </div>
  )
}