'use client'

import { useState } from 'react'
import { addEmployeeAction } from '@/app/actions/employees'
import { X, Plus, Loader2 } from 'lucide-react'

export default function AddEmployeeModal({departments}: { departments: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const result = await addEmployeeAction(formData)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
      // إعادة تعيين النموذج
      event.currentTarget.reset()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <Plus size={16} />
        إضافة موظف
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">تسجيل موظف جديد</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <input name="fullName" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: أحمد محمد" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" name="email" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@aiwa.com" dir="ltr" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
                <input type="password" name="password" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" dir="ltr" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
  <label className="block text-xs font-bold text-gray-700 mb-1">القسم</label>
  <select 
    name="departmentId" 
    required // إضافة required للتأكد من الاختيار من طرف المتصفح أيضاً
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
                  <select name="role" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="EMPLOYEE">موظف</option>
                    <option value="SUPERVISOR">مشرف</option>
                    <option value="MANAGER">مدير</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0f172a] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'حفظ البيانات'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}