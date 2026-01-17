'use client'

import { useState } from 'react'
import { editEmployeeAction } from '@/app/actions/employees'
import { X, UserCog, Loader2, Save, User, Clock } from 'lucide-react'

export default function EditEmployeeModal({ employee, departments }: { employee: any, departments: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    formData.append('id', employee.id)

    const result = await editEmployeeAction(formData)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="تعديل"
      >
        <UserCog size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto scrollbar-hide">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-gray-800">تعديل بيانات {employee.fullName}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <input 
                    name="fullName" 
                    defaultValue={employee.fullName} 
                    required 
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">معرف الدخول (اسم أو إيميل)</label>
                <div className="relative">
                    <input 
                        type="text" 
                        name="email" 
                        defaultValue={employee.email || employee.username} // عرض الإيميل أو اليوزرنيم الحالي
                        required 
                        className="w-full px-3 py-2 pl-8 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        dir="ltr"
                    />
                    <User className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور (اتركها فارغة للإبقاء على القديمة)</label>
                <input 
                    type="text" 
                    name="password" 
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="تغيير كلمة المرور..."
                    dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القسم</label>
                  <select 
                    name="departmentId" 
                    defaultValue={employee.departmentId || ''}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">اختر القسم...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الدور الوظيفي</label>
                  <select 
                    name="role" 
                    defaultValue={employee.role}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="EMPLOYEE">موظف</option>
                    <option value="SUPERVISOR">مشرف</option>
                  </select>
                </div>
              </div>

               {/* === جديد: مواعيد العمل الخاصة === */}
               <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-1">
                  <Clock size={14} /> مواعيد عمل خاصة (اختياري)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">وقت الحضور</label>
                    <input 
                      type="time" 
                      name="customStartTime" 
                      defaultValue={employee.customStartTime || ''} // القيمة الحالية
                      className="w-full px-2 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">وقت الانصراف</label>
                    <input 
                      type="time" 
                      name="customEndTime" 
                      defaultValue={employee.customEndTime || ''} // القيمة الحالية
                      className="w-full px-2 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">اتركها فارغة لتطبيق المواعيد العامة للنظام.</p>
              </div>

              {/* حالة الحساب */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <input 
                    type="checkbox" 
                    name="isActive" 
                    id={`isActive-${employee.id}`}
                    defaultChecked={employee.isActive}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={`isActive-${employee.id}`} className="text-sm text-gray-700 font-bold">حساب نشط</label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> حفظ التعديلات</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}