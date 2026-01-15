'use client'

import { toggleOvertimeAction } from '@/app/actions/manager'
import { Zap, AlertCircle, Clock } from 'lucide-react'
import { useTransition } from 'react'

// تحديث النوع ليشمل الحقل الجديد
type Employee = {
  id: string
  fullName: string
  department: string | null
  isOvertimeEnabled: boolean
  monthlyOvertime: number // <--- الجديد
}

export default function OvertimeList({ employees }: { employees: Employee[] }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleOvertimeAction(id, currentStatus)
    })
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return (names[0][0] + (names[1]?.[0] || '')).toUpperCase()
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-3 rounded-lg shadow-lg text-white font-[Tajawal]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-yellow-300 fill-yellow-300" />
        </div>
        <div>
          <h3 className="text-xs font-bold">التحكم بالأوفر تايم</h3>
          <p className="text-[9px] text-purple-100">الشهر الحالي</p>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex flex-col items-center justify-center text-purple-600 font-bold">
                   <span className="text-[9px]">{getInitials(emp.fullName)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[10px]">{emp.fullName}</h4>
                  {/* عرض ساعات الأوفر تايم هنا */}
                  <div className="flex items-center gap-1 text-[9px] text-yellow-300">
                    <Clock size={10} />
                    <span>{emp.monthlyOvertime} ساعة إضافية</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={isPending}
                onClick={() => handleToggle(emp.id, emp.isOvertimeEnabled)}
                className={`px-2 py-1 rounded-md font-bold text-[9px] transition-all border ${
                  emp.isOvertimeEnabled 
                    ? 'bg-green-500 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                }`}
              >
                {emp.isOvertimeEnabled ? 'تفعيل' : 'تعطيل'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 flex items-start gap-2">
        <AlertCircle size={14} className="text-yellow-300 flex-shrink-0" />
        <p className="text-[9px] text-purple-100 leading-tight">
          يتم احتساب الساعات تلقائياً عند تجاوز 8 ساعات عمل للموظفين المفعلين فقط.
        </p>
      </div>
    </div>
  )
}