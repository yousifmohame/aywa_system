import { getAllComplaintsAction } from '@/app/actions/complaints'
import { prisma } from '@/app/lib/prisma'
import { FileText, Search, CircleAlert, User, Wrench } from 'lucide-react'
import AssignButton from './AssignButton'

export default async function ComplaintsPage() {
  // 1. جلب البيانات
  const res = await getAllComplaintsAction()
  const complaints = res.data || []

  // 2. جلب الموظفين
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, fullName: true }
  })

  // 3. الإحصائيات
  const stats = {
    new: complaints.filter(c => c.status === 'PENDING').length,
    solved: complaints.filter(c => c.status === 'SOLVED').length,
    closed: complaints.filter(c => c.status === 'CLOSED').length,
    total: complaints.length
  }

  // ألوان ونصوص الحالة
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

        {/* === Content Area === */}
        {complaints.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-400 font-medium">لا توجد شكاوى حالياً</p>
           </div>
        ) : (
          <>
            {/* 1. عرض الجوال (Mobile View) - Cards 
                يظهر فقط في الشاشات الصغيرة (md:hidden)
            */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {complaints.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  
                  {/* Card Header: Order # & Status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-gray-400 font-medium block mb-1">رقم البلاغ</span>
                      <span className="text-base font-bold text-blue-600 font-mono">#{c.orderNumber || '---'}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColors[c.status] || 'bg-gray-100'}`}>
                      {statusText[c.status]}
                    </span>
                  </div>

                  {/* Card Body: Details */}
                  <div className="space-y-3 pt-3 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <User size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">العميل</span>
                        <span className="font-bold">{c.clientName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <Wrench size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">الخدمة</span>
                        <span className="font-medium">{c.serviceType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Assign & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                     <div>
                        {c.assignedTo ? (
                           <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                              <span className="text-[10px] text-indigo-400">مسند لـ:</span>
                              <span className="text-xs font-bold text-indigo-700">{c.assignedTo.fullName}</span>
                           </div>
                        ) : (
                           <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">غير مسند</span>
                        )}
                     </div>
                     
                     {/* زر الإجراءات */}
                     <div>
                        <AssignButton complaint={c} employees={employees} />
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. عرض سطح المكتب (Desktop View) - Table 
                يظهر فقط في الشاشات المتوسطة والكبيرة (hidden md:block)
            */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">رقم البلاغ</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">الخدمة</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider">المسند إليه</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-600 text-xs uppercase tracking-wider">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 font-bold text-blue-600 font-mono">#{c.orderNumber || '---'}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              <User size={12} />
                            </div>
                            {c.clientName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{c.serviceType}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[c.status] || 'bg-gray-100'}`}>
                            {statusText[c.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           {c.assignedTo ? (
                               <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 inline-block">
                                 {c.assignedTo.fullName}
                               </span>
                           ) : (
                               <span className="text-gray-400 text-[10px] italic">-- غير مسند --</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <AssignButton complaint={c} employees={employees} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

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