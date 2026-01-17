import { prisma } from '@/app/lib/prisma'
import AddEmployeeModal from '@/app/components/employees/AddEmployeeModal'
import { Search, Trash2, UserCog } from 'lucide-react'
import { deleteEmployeeAction } from '@/app/actions/employees'
import EditEmployeeModal from '@/app/components/employees/EditEmployeeModal'

// إضافة هذا السطر لمنع الكاش وضمان تحديث البيانات دائماً
export const dynamic = 'force-dynamic'

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }> // تحديث النوع ليتوافق مع Next.js 15
}) {
  const params = await searchParams
  const query = params?.query || ''

  // جلب الموظفين
  const employees = await prisma.user.findMany({
    where: {
      fullName: { contains: query },
      role: { not: 'MANAGER' },
    },
    include: { 
      department: true 
    },
    orderBy: { createdAt: 'desc' },
  })

  const departments = await prisma.department.findMany()

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-xs text-gray-500">إضافة وتعديل بيانات فريق العمل</p>
        </div>
        <AddEmployeeModal departments={departments} />
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3 relative group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {emp.fullName.split(' ')[0][0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{emp.fullName}</p>
                  <p className="text-xs text-gray-400">{emp.email}</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold flex items-center gap-1 ${
                emp.isActive ? 'text-green-600' : 'text-red-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  emp.isActive ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {emp.isActive ? 'نشط' : 'متوقف'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full font-bold ${
                emp.department?.name.includes('خدمة')
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-orange-50 text-orange-600'
              }`}>
                {emp.department?.name || 'غير محدد'}
              </span>

              <span className="text-gray-500">
                {emp.role === 'SUPERVISOR' ? 'مشرف فريق' : 'موظف'}
              </span>
            </div>

            <div className="text-xs text-gray-400">
              تاريخ الانضمام: {new Date(emp.createdAt).toLocaleDateString('ar-EG')}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              {/* زر التعديل */}
              <EditEmployeeModal employee={emp} departments={departments} />

              {/* زر الحذف المصحح */}
              <form action={deleteEmployeeAction.bind(null, emp.id)}>
                <button
                  type="submit"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف الموظف"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full text-center text-gray-400 text-sm py-10">
            لا يوجد موظفين حالياً. ابدأ بإضافة موظف جديد.
          </div>
        )}
      </div>
    </div>
  )
}