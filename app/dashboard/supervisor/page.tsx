import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  Users, Package, PhoneIncoming, Timer, 
  TrendingUp, Award, Briefcase, Zap, Clock, Calendar
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

  const isFulfillment = supervisor.department.name.includes('تجهيز') || supervisor.department.name.includes('تنفيذ')
  
  // إعداد التواريخ
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // 2. جلب إحصائيات القسم لليوم (Aggregation)
  const todayStats = await prisma.dailyPerformance.aggregate({
    where: {
      user: { departmentId: supervisor.departmentId },
      date: { gte: today }
    },
    _sum: {
      callsCount: true,
      ordersPrepared: true,
      workHours: true, // ساعات العمل اليومية للفريق
    },
    _avg: {
      score: true,
      avgResponseTime: true,
      avgPrepTime: true,
    }
  })

  // 3. جلب إجمالي الأوفر تايم للقسم (لهذا الشهر)
  const monthlyStats = await prisma.dailyPerformance.aggregate({
    where: {
      user: { departmentId: supervisor.departmentId },
      date: { gte: startOfMonth }
    },
    _sum: {
      overtimeHours: true
    }
  })

  // 4. جلب فريق العمل مع أدائهم (للشهر الحالي بالكامل لحساب التراكمي)
  const teamMembers = await prisma.user.findMany({
    where: { 
      departmentId: supervisor.departmentId,
      id: { not: userId },
      role: 'EMPLOYEE'
    },
    include: {
      tasksAssigned: { where: { status: 'IN_PROGRESS' } },
      // نجلب أداء الشهر الحالي بالكامل
      performances: { 
        where: { date: { gte: startOfMonth } },
        orderBy: { date: 'desc' } // الأحدث (اليوم) يكون أول واحد
      }
    },
    orderBy: { fullName: 'asc' }
  })

  // تجهيز الأرقام للعرض
  const productionVolume = isFulfillment ? (todayStats._sum.ordersPrepared || 0) : (todayStats._sum.callsCount || 0)
  const speedMetric = isFulfillment ? Math.round(todayStats._avg.avgPrepTime || 0) : Math.round(todayStats._avg.avgResponseTime || 0)
  const avgScore = Math.round(todayStats._avg.score || 0)
  const departmentOvertime = monthlyStats._sum.overtimeHours || 0

  // معالجة بيانات الموظفين (استخراج بيانات اليوم + تجميع بيانات الشهر)
  const processedTeam = teamMembers.map(member => {
    // العثور على سجل اليوم
    const todayPerf = member.performances.find(p => new Date(p.date).setHours(0,0,0,0) === today.getTime())
    
    // حساب الأوفر تايم الشهري
    const monthlyOvertime = member.performances.reduce((sum, p) => sum + (p.overtimeHours || 0), 0)
    
    return {
      ...member,
      todayPerf,
      monthlyOvertime,
      // بيانات الإنتاجية لليوم (للترتيب)
      todayVol: isFulfillment ? (todayPerf?.ordersPrepared || 0) : (todayPerf?.callsCount || 0)
    }
  })

  // ترتيب الموظفين حسب الإنتاجية اليوم
  const sortedTeam = [...processedTeam].sort((a, b) => b.todayVol - a.todayVol)

  const topPerformer = sortedTeam[0]

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">غرفة عمليات {supervisor.department.name}</h1>
          <p className="text-blue-200 text-sm">متابعة حية للأداء، الحضور، والإنتاجية</p>
        </div>
        <div className="relative z-10 text-left">
           <div className="text-3xl font-bold">{avgScore}%</div>
           <div className="text-[10px] text-blue-300">متوسط جودة الفريق</div>
        </div>
        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/5" size={120} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* 1. بطاقة الإنتاجية */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">{isFulfillment ? 'طلبات تم تجهيزها' : 'مكالمات اليوم'}</p>
               <h3 className="text-2xl font-bold text-gray-800">{productionVolume}</h3>
             </div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               {isFulfillment ? <Package size={20} /> : <PhoneIncoming size={20} />}
             </div>
          </div>
        </div>

        {/* 2. بطاقة السرعة */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">{isFulfillment ? 'وقت التحضير' : 'سرعة الرد'}</p>
               <h3 className="text-2xl font-bold text-gray-800">
                 {speedMetric} <span className="text-sm font-normal text-gray-400">{isFulfillment ? 'دقيقة' : 'ثانية'}</span>
               </h3>
             </div>
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
               <Timer size={20} />
             </div>
          </div>
        </div>

        {/* 3. بطاقة الأوفر تايم (الجديدة) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs text-gray-500 font-bold mb-1">أوفر تايم القسم (شهري)</p>
               <h3 className="text-2xl font-bold text-gray-800">
                  {departmentOvertime.toFixed(1)} <span className="text-sm font-normal text-gray-400">ساعة</span>
               </h3>
             </div>
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
               <Zap size={20} />
             </div>
          </div>
          <div className="mt-2 text-[10px] text-purple-600 font-bold flex items-center gap-1">
            <Calendar size={12} /> هذا الشهر
          </div>
        </div>

        {/* 4. بطاقة أفضل موظف */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-orange-800/70 font-bold mb-1 truncate">الأعلى إنتاجية</p>
              <h3 className="text-lg font-bold text-orange-900 truncate max-w-[120px]">
                  {topPerformer ? topPerformer.fullName.split(' ')[0] : '---'}
              </h3>
            </div>
            <div className="p-2 bg-white text-yellow-500 rounded-lg shadow-sm">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-orange-800 font-bold">
            أنجز {topPerformer ? topPerformer.todayVol : 0} {isFulfillment ? 'طلب' : 'مكالمة'}
          </div>
        </div>
      </div>

      {/* Live Leaderboard Table */}
      <div className="md:hidden space-y-2">
        {sortedTeam.map((member, idx) => {
          const perf = member.todayPerf
          const vol = member.todayVol
          const isBusy = member.tasksAssigned.length > 0
          // تنسيق الوقت
          const checkInTime = perf?.checkIn ? new Date(perf.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '--:--'
          const checkOutTime = perf?.checkOut ? new Date(perf.checkOut).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '--:--'

          return (
            <div key={member.id} className="bg-white p-4 rounded-2xl shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 font-bold text-sm text-gray-600">{idx + 1}</div>
                    <div>
                        <Link href={`/dashboard/supervisor/employees/${member.id}`}>
                            <span className="text-sm font-bold text-gray-800 block">{member.fullName}</span>
                        </Link>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${perf?.checkIn && !perf?.checkOut ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {perf?.checkIn && !perf?.checkOut ? 'حاضر الآن' : 'غير متواجد'}
                        </span>
                    </div>
                </div>
                <div className="text-left">
                    <span className="block font-bold text-blue-600">{vol} {isFulfillment ? 'طلب' : 'مكالمة'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded-lg">
                 <div className="flex justify-between">
                    <span className="text-gray-500">الحضور:</span>
                    <span className="font-bold">{checkInTime}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">Overtime:</span>
                    <span className="font-bold text-purple-600">{member.monthlyOvertime.toFixed(1)} س</span>
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                سجل الحضور والإنتاجية (مباشر)
             </h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold">#</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold">الموظف</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">حضور اليوم</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">ساعات العمل</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">الإنتاجية</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">أوفر تايم (شهري)</th>
              <th className="px-6 py-3 text-xs text-gray-500 font-bold text-center">الجودة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedTeam.map((member, idx) => {
              const perf = member.todayPerf
              const vol = member.todayVol
              const score = perf?.score || 0
              
              // تنسيق الوقت
              const checkInTime = perf?.checkIn ? new Date(perf.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '-'
              const checkOutTime = perf?.checkOut ? new Date(perf.checkOut).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '-'
              
              const isPresent = perf?.checkIn && !perf?.checkOut

              return (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-block w-6 h-6 text-center leading-6 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx+1}</span>
                  </td>
                  <td className="px-6 py-4">
                      <Link href={`/dashboard/supervisor/employees/${member.id}`} className="hover:text-blue-600 transition-colors font-bold text-gray-700">
                        {member.fullName}
                      </Link>
                      <div className="text-[9px] text-gray-400 mt-0.5">
                        {isPresent ? <span className="text-green-500">● متواجد الآن</span> : 'غير متواجد'}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-mono text-gray-600">
                    {checkInTime} - {checkOutTime}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-700">{perf?.workHours || 0}</span> <span className="text-[10px] text-gray-400">س</span>
                  </td>
                  <td className="px-6 py-4 text-center text-blue-600 font-bold">
                    {vol}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {member.monthlyOvertime > 0 ? (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold">
                            +{member.monthlyOvertime.toFixed(1)} س
                        </span>
                    ) : (
                        <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                     <span className={`${score >= 90 ? 'text-green-600' : score >= 75 ? 'text-orange-500' : 'text-red-500'}`}>{score}%</span>
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