import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  Users, Package, PhoneIncoming, Timer, 
  TrendingUp, Award, Briefcase, Zap
} from 'lucide-react'
import Link from 'next/link'

export default async function SupervisorDashboard() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  // 1. معرفة بيانات المشرف وقسمه
  const supervisor = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })

  if (!supervisor || !supervisor.departmentId) {
    return <div className="p-8 text-center text-red-500">حساب غير مكتمل.</div>
  }

  // تحديد نوع القسم (خدمة عملاء أم تجهيز)
  const isFulfillment = supervisor.department.name.includes('تجهيز') || supervisor.department.name.includes('تنفيذ')
  
  // تحديد تواريخ اليوم
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 2. جلب إحصائيات القسم لليوم (Aggregation)
  const todayStats = await prisma.dailyPerformance.aggregate({
    where: {
      user: { departmentId: supervisor.departmentId },
      date: { gte: today }
    },
    _sum: {
      callsCount: true,
      ordersPrepared: true,
    },
    _avg: {
      score: true,
      avgResponseTime: true, // سرعة الرد
      avgPrepTime: true,     // وقت التحضير
    }
  })

  // 3. جلب فريق العمل مع أدائهم اليوم
  const teamMembers = await prisma.user.findMany({
    where: { 
      departmentId: supervisor.departmentId,
      id: { not: userId }, // استبعاد المشرف نفسه
      role: 'EMPLOYEE'
    },
    include: {
      tasksAssigned: { where: { status: 'IN_PROGRESS' } },
      performances: { where: { date: { gte: today } } }
    },
    orderBy: { fullName: 'asc' }
  })

  // تجهيز الأرقام للعرض
  const productionVolume = isFulfillment ? (todayStats._sum.ordersPrepared || 0) : (todayStats._sum.callsCount || 0)
  const speedMetric = isFulfillment ? Math.round(todayStats._avg.avgPrepTime || 0) : Math.round(todayStats._avg.avgResponseTime || 0)
  const avgScore = Math.round(todayStats._avg.score || 0)

  // ترتيب الموظفين حسب الإنتاجية اليوم
  const sortedTeam = [...teamMembers].sort((a, b) => {
    const volA = isFulfillment ? (a.performances[0]?.ordersPrepared || 0) : (a.performances[0]?.callsCount || 0)
    const volB = isFulfillment ? (b.performances[0]?.ordersPrepared || 0) : (b.performances[0]?.callsCount || 0)
    return volB - volA
  })

  const topPerformer = sortedTeam[0]
  const topPerformerVol = isFulfillment ? (topPerformer?.performances[0]?.ordersPrepared || 0) : (topPerformer?.performances[0]?.callsCount || 0)

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">غرفة عمليات {supervisor.department.name}</h1>
          <p className="text-blue-200 text-sm">متابعة حية للأداء والإنتاجية</p>
        </div>
        <div className="relative z-10 text-left">
           <div className="text-3xl font-bold">{avgScore}%</div>
           <div className="text-[10px] text-blue-300">متوسط أداء الفريق</div>
        </div>
        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/5" size={120} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* بطاقة الإنتاجية */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">{isFulfillment ? 'طلبات تم تجهيزها' : 'مكالمات تم الرد عليها'}</p>
               <h3 className="text-2xl font-bold text-gray-800">{productionVolume}</h3>
             </div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               {isFulfillment ? <Package size={20} /> : <PhoneIncoming size={20} />}
             </div>
          </div>
          <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> إنتاج اليوم
          </div>
        </div>

        {/* بطاقة السرعة */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">{isFulfillment ? 'متوسط وقت التحضير' : 'متوسط سرعة الرد'}</p>
               <h3 className="text-2xl font-bold text-gray-800">
                 {speedMetric} <span className="text-sm font-normal text-gray-400">{isFulfillment ? 'دقيقة' : 'ثانية'}</span>
               </h3>
             </div>
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
               <Timer size={20} />
             </div>
          </div>
        </div>

        {/* بطاقة الفريق */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">الموظفين النشطين</p>
               <h3 className="text-2xl font-bold text-gray-800">{teamMembers.length}</h3>
             </div>
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
               <Users size={20} />
             </div>
          </div>
        </div>

        {/* بطاقة أفضل موظف */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-orange-800/70 font-bold mb-1">الأعلى إنتاجية اليوم</p>
               <h3 className="text-lg font-bold text-orange-900 truncate max-w-[120px]">
                 {topPerformer ? topPerformer.fullName : '---'}
               </h3>
             </div>
             <div className="p-2 bg-white text-yellow-500 rounded-lg shadow-sm">
               <Award size={20} />
             </div>
          </div>
          <div className="mt-2 text-[11px] text-orange-800 font-bold">
            أنجز {topPerformerVol} {isFulfillment ? 'طلب' : 'مكالمة'}
          </div>
        </div>
      </div>

      {/* Live Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            ترتيب الموظفين المباشر (Live)
          </h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold">#</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold">الموظف</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">الحالة</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">
                {isFulfillment ? 'الطلبات' : 'المكالمات'}
              </th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">
                {isFulfillment ? 'وقت التحضير' : 'سرعة الرد'}
              </th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">الجودة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedTeam.map((member, idx) => {
              const perf = member.performances[0]
              const vol = isFulfillment ? (perf?.ordersPrepared || 0) : (perf?.callsCount || 0)
              const time = isFulfillment ? (perf?.avgPrepTime || 0) : (perf?.avgResponseTime || 0)
              const score = perf?.score || 0
              const isBusy = member.tasksAssigned.length > 0

              return (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-block w-6 h-6 text-center leading-6 rounded-full text-[10px] font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                    }`}>{idx + 1}</span>
                  </td>
                
                  <td className="px-6 py-4">
                   <Link href={`/dashboard/supervisor/employees/${member.id}`} className="hover:underline">
                     <span className="text-sm font-bold text-gray-800">{member.fullName}</span>
                   </Link>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      isBusy ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {isBusy ? 'يعمل' : 'متاح'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-blue-600">{vol}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-gray-600">
                      {time} {isFulfillment ? 'د' : 'ث'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`text-xs font-bold ${score >= 90 ? 'text-green-600' : 'text-gray-600'}`}>
                       {score}%
                     </span>
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