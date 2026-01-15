import { prisma } from '@/app/lib/prisma'
import { createDepartmentAction, deleteDepartmentAction } from '@/app/actions/departments'
import { Trash2, Plus } from 'lucide-react'

export default async function DepartmentsSettingsPage() {
  // جلب الأقسام
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } }
  })

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">إدارة الأقسام</h1>
        <p className="text-xs text-gray-500">إضافة وتعديل أقسام الشركة والهيكل التنظيمي</p>
      </div>

      {/* نموذج إضافة سريع */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">إضافة قسم جديد</h3>
        <form action={createDepartmentAction} className="flex gap-2">
          <input 
            name="name" 
            placeholder="اسم القسم (مثلاً: المحاسبة)" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input 
            name="description" 
            placeholder="وصف مختصر (اختياري)" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> إضافة
          </button>
        </form>
      </div>

      {/* قائمة الأقسام */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500">اسم القسم</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500">الوصف</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500">عدد الموظفين</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {departments.map((dept) => {
              // الحل السحري هنا: استخدام bind لربط الـ ID بالأكشن
              const deleteDeptWithId = deleteDepartmentAction.bind(null, dept.id)

              return (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">{dept.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{dept.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                      {dept._count.employees} موظف
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {/* الآن نمرر الدالة المجهزة للـ action */}
                    <form action={deleteDeptWithId}>
                      <button className="text-gray-400 hover:text-red-600 transition-colors" title="حذف">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}