'use client'

import { useState } from 'react'
import { updateEmployeeAction } from '@/app/actions/employees'
import { UserCog, X, Loader2, Save } from 'lucide-react'

// تعريف نوع البيانات المتوقع
type Props = {
  employee: any
  departments: any[]
}

export default function EditEmployeeModal({ employee, departments }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // إضافة الـ ID يدوياً لأنه غير موجود في حقول الإدخال الظاهرة
    formData.append('id', employee.id)
    
    await updateEmployeeAction(formData)
    
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* زر فتح النافذة (نفس شكل الزر القديم) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
        title="تعديل"
      >
        <UserCog size={16} />
      </button>

      {/* النافذة المنبثقة */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800">تعديل بيانات: {employee.fullName}</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">الاسم الكامل</label>
                <input name="fullName" defaultValue={employee.fullName} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">البريد الإلكتروني</label>
                <input type="email" name="email" defaultValue={employee.email} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">القسم</label>
                    <select name="departmentId" defaultValue={employee.departmentId || ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">اختر القسم...</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">الدور</label>
                    <select name="role" defaultValue={employee.role} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="EMPLOYEE">موظف</option>
                    <option value="SUPERVISOR">مشرف</option>
                    <option value="MANAGER">مدير</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">تغيير كلمة المرور (اختياري)</label>
                <input type="password" name="password" placeholder="اتركه فارغاً للإبقاء على القديمة" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="isActive" id="isActive" defaultChecked={employee.isActive} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">الحساب نشط (يمكنه الدخول للنظام)</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0f172a] text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-900 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> حفظ التعديلات</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}