import { getAllComplaintsAction } from '@/app/actions/complaints'
import { prisma } from '@/app/lib/prisma'
import { FileText, Search, Eye, CircleAlert, UserPlus, Filter } from 'lucide-react'
import AssignButton from './AssignButton' // سننشئه في الأسفل لدمج المودال

export default async function ComplaintsPage() {
  // 1. جلب الشكاوى
  const res = await getAllComplaintsAction()
  const complaints = res.data || []

  // 2. جلب قائمة الموظفين (للإسناد)
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, fullName: true }
  })

  // 3. حساب الإحصائيات
  const stats = {
    new: complaints.filter(c => c.status === 'PENDING').length,
    solved: complaints.filter(c => c.status === 'SOLVED').length,
    closed: complaints.filter(c => c.status === 'CLOSED').length,
    total: complaints.length
  }

  const statusColors: any = {
    'PENDING': 'bg-blue-100 text-blue-700 border-blue-200',
    'SOLVED': 'bg-green-100 text-green-700 border-green-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const statusText: any = {
    'PENDING': 'جديد / قيد المعالجة',
    'SOLVED': 'تم الحل',
    'CLOSED': 'مغلق',
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto" dir="rtl">
      <div className="space-y-6">
        
        {/* Header & Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">إدارة شكاوى العملاء</h1>
                <p className="text-xs text-gray-500">متابعة وتوزيع البلاغات الواردة من العملاء</p>
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث برقم البلاغ أو اسم العميل..." 
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="جديد / معالجة" count={stats.new} color="blue" />
            <StatCard label="تم الحل" count={stats.solved} color="green" />
            <StatCard label="مغلق" count={stats.closed} color="gray" />
            <StatCard label="الإجمالي" count={stats.total} color="indigo" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">رقم البلاغ</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">العميل</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">النوع</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">المسند إليه</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">لا توجد شكاوى حالياً</td></tr>
                ) : (
                    complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3 font-bold text-blue-600">#{c.orderNumber || '---'}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{c.clientName}</td>
                        <td className="px-4 py-3 text-gray-600">{c.serviceType}</td>
                        <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[c.status] || 'bg-gray-100'}`}>
                            {statusText[c.status]}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                           {c.assignedTo ? (
                               <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md w-fit">
                                 👤 {c.assignedTo.fullName}
                               </span>
                           ) : (
                               <span className="text-gray-400 text-[10px]">غير مسند</span>
                           )}
                        </td>
                        <td className="px-4 py-3 text-center">
                           {/* زر الإسناد والمشاهدة مفصول في مكون العميل */}
                           <AssignButton complaint={c} employees={employees} />
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note Footer */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-start gap-3">
          <CircleAlert className="text-blue-600 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-1">ملاحظة إدارية</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              يرجى إسناد الشكاوى للموظفين المختصين فور وصولها لضمان سرعة الاستجابة. يمكن للموظف رؤية الشكوى في لوحته الخاصة بمجرد الإسناد.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, count, color }: any) {
    const colors: any = {
        blue: 'border-blue-100 text-blue-600 bg-blue-50',
        green: 'border-green-100 text-green-600 bg-green-50',
        yellow: 'border-yellow-100 text-yellow-600 bg-yellow-50',
        gray: 'border-gray-200 text-gray-600 bg-gray-50',
        indigo: 'border-indigo-100 text-indigo-600 bg-indigo-50',
    }
    return (
        <div className={`rounded-lg p-3 border ${colors[color]} bg-white`}>
            <div className="text-2xl font-bold mb-1">{count}</div>
            <div className="text-[10px] text-gray-500 font-medium">{label}</div>
        </div>
    )
}