import { prisma } from '@/app/lib/prisma'
import { createDepartmentAction, deleteDepartmentAction } from '@/app/actions/departments'
import { Trash2, Plus } from 'lucide-react'
import EditDepartmentModal from '@/app/components/departments/EditDepartmentModal' // <--- استدعاء المكون

export default async function DepartmentsSettingsPage() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } }
  })

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">إدارة الأقسام</h1>
        <p className="text-xs text-gray-500">إضافة وتعديل أقسام الشركة والهيكل التنظيمي</p>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">إضافة قسم جديد</h3>
        <form action={createDepartmentAction} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="name" placeholder="اسم القسم" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full" required />
          <input name="description" placeholder="وصف مختصر" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
            <Plus size={16} /> إضافة
          </button>
        </form>
      </div>

      {/* قائمة الأقسام */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deleteDeptWithId = deleteDepartmentAction.bind(null, dept.id)

          return (
            <div key={dept.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3">
              
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-gray-400">{dept.description || '—'}</p>
              </div>

              <div>
                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                  {dept._count.employees} موظف
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                
                {/* زر التعديل الجديد */}
                <EditDepartmentModal department={dept} />

                {/* زر الحذف */}
                <form action={deleteDeptWithId}>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف القسم">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          )
        })}

        {departments.length === 0 && (
          <div className="col-span-full text-center text-gray-400 text-sm py-10">
            لا توجد أقسام مضافة بعد
          </div>
        )}
      </div>
    </div>
  )
}