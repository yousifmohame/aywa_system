'use client'

import { useState } from 'react'
import { toggleAttendanceAction } from '@/app/actions/supervisor'
import { Clock, LogIn, LogOut, PlayCircle, StopCircle } from 'lucide-react'

export default function AttendanceCard({ performance, employeeId }: { performance: any, employeeId: string }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleAttendanceAction(employeeId)
    setLoading(false)
  }

  const isCheckedIn = performance?.checkIn && !performance?.checkOut
  const isCheckedOut = performance?.checkOut

  // تنسيق الوقت
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          سجل الدوام اليوم
        </h3>
        {performance?.workHours && (
          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-md font-bold">
            عدد الساعات: {performance.workHours} س
          </span>
        )}
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
        <div className="text-center">
          <span className="text-[10px] text-gray-400 block mb-1">وقت الدخول</span>
          <span className="text-sm font-bold text-gray-800">
            {performance?.checkIn ? formatTime(performance.checkIn) : '--:--'}
          </span>
        </div>
        <div className="h-8 w-[1px] bg-gray-200"></div>
        <div className="text-center">
          <span className="text-[10px] text-gray-400 block mb-1">وقت الانصراف</span>
          <span className="text-sm font-bold text-gray-800">
            {performance?.checkOut ? formatTime(performance.checkOut) : '--:--'}
          </span>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading || isCheckedOut}
        className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all text-white
          ${isCheckedOut 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isCheckedIn 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
      >
        {loading ? 'جاري التنفيذ...' : isCheckedOut ? (
          <>✅ انتهى الدوام</>
        ) : isCheckedIn ? (
          <><LogOut size={16} /> تسجيل انصراف</>
        ) : (
          <><LogIn size={16} /> تسجيل حضور</>
        )}
      </button>
    </div>
  )
}