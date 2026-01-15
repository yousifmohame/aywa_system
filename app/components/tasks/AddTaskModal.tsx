'use client'

import { useState } from 'react'
import { createTaskAction } from '@/app/actions/tasks'
import { Plus, X, Loader2, Calendar } from 'lucide-react'

// نستقبل قائمة الموظفين لنعرضهم في القائمة المنسدلة
export default function AddTaskModal({ employees }: { employees: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    await createTaskAction(formData)
    
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <Plus size={16} />
        مهمة جديدة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800">إسناد مهمة جديدة</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">عنوان المهمة</label>
                <input name="title" required placeholder="مثال: مراجعة طلبات العملاء المعلقة" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">التفاصيل (اختياري)</label>
                <textarea name="description" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="اكتب تفاصيل المهمة هنا..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">إسناد إلى</label>
                <select name="assignedToId" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">اختر الموظف...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                       {emp.fullName} - {emp.department?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ التسليم</label>
                <div className="relative">
                    <input type="date" name="dueDate" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pl-10" />
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0f172a] text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-900 transition-colors mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'حفظ المهمة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}