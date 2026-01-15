import { prisma } from '@/app/lib/prisma'
import AddEmployeeModal from '@/app/components/employees/AddEmployeeModal'
import { Search, Trash2, UserCog } from 'lucide-react'
import { deleteEmployeeAction } from '@/app/actions/employees'
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal'

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: { query?: string }
}) {
  const query = searchParams?.query || ''

  // جلب الموظفين مع البحث
  const employees = await prisma.user.findMany({
    where: {
      fullName: { contains: query },
      // لا نريد عرض المدير العام في القائمة لتجنب حذفه بالخطأ
      role: { not: 'MANAGER' },
    },
    // تصحيح: include يجب أن تكون خارج where
    include: { 
      department: true 
    },
    orderBy: { createdAt: 'desc' },
  })

  // جلب الأقسام لتمريرها للمودال
  const departments = await prisma.department.findMany()

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-xs text-gray-500">إضافة وتعديل بيانات فريق العمل</p>
        </div>
        {/* نمرر الأقسام هنا للمودال */}
        <AddEmployeeModal departments={departments} />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث باسم الموظف..." 
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500">الموظف</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500">القسم</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500">الدور</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500">تاريخ الانضمام</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {emp.fullName.split(' ')[0][0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{emp.fullName}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* تصحيح: التعامل مع القسم ككائن (Object) */}
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      // فحص الاسم بدلاً من الكود الثابت، أو وضع لون افتراضي
                      emp.department?.name === 'خدمة العملاء' 
                        ? 'bg-purple-50 text-purple-600' 
                        : emp.department?.name === 'تجهيز الطلبات'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-gray-100 text-gray-600' // لون افتراضي للأقسام الجديدة
                    }`}>
                      {emp.department?.name || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">
                      {emp.role === 'SUPERVISOR' ? 'مشرف فريق' : 'موظف'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${emp.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {emp.isActive ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(emp.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <EditEmployeeModal employee={emp} departments={departments} />
                      <form action={async () => {
                        'use server'
                        await deleteEmployeeAction(emp.id)
                      }}>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    لا يوجد موظفين حالياً. ابدأ بإضافة موظف جديد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}