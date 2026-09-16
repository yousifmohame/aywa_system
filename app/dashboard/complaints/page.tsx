// app/dashboard/complaints/page.tsx
import { getAllComplaintsAction } from '@/app/actions/complaints'
import { prisma } from '@/app/lib/prisma'
import { FileText, Search, CircleAlert } from 'lucide-react'
import ComplaintsList from './ComplaintsList' // استيراد المكون الجديد

export default async function ComplaintsPage() {
  // 1. جلب أول 50 شكوى (الصفحة الأولى) لتهيئة الصفحة بسرعة
  const res = await getAllComplaintsAction(1, 50)
  const complaints = res.data || []
  const metadata = res.metadata || { total: 0, page: 1, totalPages: 1 }

  // 2. جلب الموظفين للإسناد
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, fullName: true }
  })

  // 3. جلب الإحصائيات الكلية من قاعدة البيانات بسرعة
  const [newCount, solvedCount, closedCount] = await Promise.all([
    prisma.complaint.count({ where: { status: 'PENDING' } }),
    prisma.complaint.count({ where: { status: 'SOLVED' } }),
    prisma.complaint.count({ where: { status: 'CLOSED' } })
  ])

  const stats = {
    new: newCount,
    solved: solvedCount,
    closed: closedCount,
    total: metadata.total 
  }

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto font-[Tajawal]" dir="rtl">
      <div className="space-y-6">
        
        {/* === Header & Search === */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">إدارة شكاوى العملاء</h1>
                <p className="text-xs text-gray-500 mt-0.5">متابعة وتوزيع البلاغات الواردة</p>
              </div>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث برقم البلاغ..." 
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white" 
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="جديد / معالجة" count={stats.new} color="blue" />
            <StatCard label="تم الحل" count={stats.solved} color="green" />
            <StatCard label="مغلق" count={stats.closed} color="gray" />
            <StatCard label="الإجمالي" count={stats.total} color="indigo" />
          </div>
        </div>

        {/* === Content Area (Infinite Scroll) === */}
        <ComplaintsList 
          initialComplaints={complaints} 
          employees={employees} 
          totalPages={metadata.totalPages}
        />

        {/* Note Footer */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
          <CircleAlert className="text-blue-600 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-1">ملاحظة إدارية</h3>
            <p className="text-xs text-blue-700 leading-relaxed max-w-2xl">
              يرجى إسناد الشكاوى للموظفين المختصين فور وصولها لضمان سرعة الاستجابة. يمكن للموظف رؤية الشكوى في لوحته الخاصة بمجرد الإسناد.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

// مكون البطاقات الإحصائية
function StatCard({ label, count, color }: any) {
    const colors: any = {
        blue: 'border-blue-100 text-blue-600 bg-blue-50',
        green: 'border-green-100 text-green-600 bg-green-50',
        yellow: 'border-yellow-100 text-yellow-600 bg-yellow-50',
        gray: 'border-gray-200 text-gray-600 bg-gray-50',
        indigo: 'border-indigo-100 text-indigo-600 bg-indigo-50',
    }
    return (
        <div className={`rounded-xl p-4 border ${colors[color]} bg-white shadow-sm flex flex-col justify-center`}>
            <div className="text-2xl font-black mb-1 font-mono tracking-tight">{count}</div>
            <div className="text-[10px] uppercase font-bold opacity-80">{label}</div>
        </div>
    )
}
