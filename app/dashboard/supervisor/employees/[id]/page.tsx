import { prisma } from '@/app/lib/prisma'
import { notFound } from 'next/navigation'
import EmployeeProfileChart from '@/app/components/supervisor/EmployeeProfileChart'
import { Clock, Trophy, Target, Star, TrendingUp, Award, ArrowRight, Calendar, Zap } from 'lucide-react'
import BadgeGifter from '@/app/components/supervisor/BadgeGifter'
import Link from 'next/link'

// Helper function to format date
const getDayName = (date: Date) => new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)

type Props = {
  params: Promise<{ id: string }>
}

export default async function EmployeeProfilePage(props: Props) {
  const params = await props.params
  const employeeId = params.id
  
  // 1. Fetch employee data + completed tasks count
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    include: { 
      department: true,
      badges: { orderBy: { createdAt: 'desc' } },
      _count: { 
        select: { 
          tasksAssigned: { where: { status: 'COMPLETED' } } 
        } 
      }
    }
  })

  if (!employee) return notFound()

  // 2. Setup dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // 3. Fetch performance data
  const [performances, todayPerf, departmentStats, monthlyStats] = await Promise.all([
    // Last 7 days performance
    prisma.dailyPerformance.findMany({
      where: { userId: employeeId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    }),
    // Today's performance
    prisma.dailyPerformance.findFirst({
      where: { userId: employeeId, date: { gte: today } }
    }),
    // Department stats for ranking
    prisma.dailyPerformance.groupBy({
      by: ['userId'],
      where: { 
        date: { gte: startOfMonth },
        user: { departmentId: employee.departmentId } 
      },
      _avg: { score: true }
    }),
    // Monthly stats (Attendance count, Overtime sum)
    prisma.dailyPerformance.aggregate({
        where: { userId: employeeId, date: { gte: startOfMonth } },
        _count: { id: true },
        _sum: { overtimeHours: true, workHours: true }
    })
  ])

  // 4. Process Data
  
  // A) Chart Data
  const chartData = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const perf = performances.find(p => new Date(p.date).toDateString() === d.toDateString())
    
    chartData.push({
      name: getDayName(d),
      score: perf?.score || 0
    })
  }

  // B) Calculate Rank
  const sortedRanks = departmentStats.sort((a, b) => (b._avg.score || 0) - (a._avg.score || 0))
  const myRankIndex = sortedRanks.findIndex(r => r.userId === employeeId)
  const rank = myRankIndex !== -1 ? myRankIndex + 1 : '-'

  // C) Format Times for Display
  const checkInTime = todayPerf?.checkIn 
    ? new Date(todayPerf.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '--:--'
    
  const checkOutTime = todayPerf?.checkOut 
    ? new Date(todayPerf.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const todayOvertime = todayPerf?.overtimeHours || 0
  const monthlyOvertime = monthlyStats._sum.overtimeHours || 0
  const monthlyWorkHours = monthlyStats._sum.workHours || 0
  const attendanceDays = monthlyStats._count.id || 0

  return (
    <div className="max-w-md mx-auto h-full flex flex-col font-[Tajawal]" dir="rtl">
      
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/supervisor" className="p-2 bg-white rounded-full text-gray-500 hover:text-blue-600 shadow-sm transition-colors">
          <ArrowRight size={18} />
        </Link>
        <div>
          <h1 className="text-base font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-[10px] text-gray-500">متابعة سجلات الموظف</p>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto pb-4 scrollbar-hide">
        
        {/* 1. Main Info Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-inner">
              <span className="text-xl font-bold">{employee.fullName.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-base font-bold">{employee.fullName}</h2>
              <p className="text-xs text-blue-100">{employee.department?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-center">
              <div className="text-sm font-bold">{todayPerf?.score || 0}%</div>
              <div className="text-[9px] text-blue-100">نتيجة اليوم</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-center">
              <div className="text-sm font-bold">#{rank}</div>
              <div className="text-[9px] text-blue-100">الترتيب</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-center">
              <div className="text-sm font-bold">{sortedRanks.length}</div>
              <div className="text-[9px] text-blue-100">أفراد الفريق</div>
            </div>
          </div>
        </div>

        {/* 2. Today's Attendance & Overtime (Read-Only) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    سجل دوام اليوم
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${todayPerf?.checkIn && !todayPerf?.checkOut ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {todayPerf?.checkIn && !todayPerf?.checkOut ? 'متواجد الآن' : 'غير متواجد'}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-500 mb-1">وقت الحضور</span>
                    <span className="font-bold text-gray-800 text-sm">{checkInTime}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-500 mb-1">وقت الانصراف</span>
                    <span className="font-bold text-gray-800 text-sm">{checkOutTime}</span>
                </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg flex justify-between items-center border border-yellow-100">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-600" />
                    <span className="text-xs font-bold text-yellow-800">أوفر تايم اليوم</span>
                </div>
                <span className="text-sm font-bold text-yellow-700">
                    {todayOvertime > 0 ? `+${todayOvertime} ساعة` : '---'}
                </span>
            </div>
        </div>

        {/* 3. Monthly Statistics Summary */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" />
                ملخص الشهر الحالي
            </h3>
            <div className="grid grid-cols-3 gap-2">
                 <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <span className="block font-bold text-purple-700 text-sm">{attendanceDays}</span>
                    <span className="text-[9px] text-purple-400">أيام حضور</span>
                 </div>
                 <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <span className="block font-bold text-blue-700 text-sm">{monthlyWorkHours.toFixed(1)}</span>
                    <span className="text-[9px] text-blue-400">ساعات عمل</span>
                 </div>
                 <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <span className="block font-bold text-orange-700 text-sm">{monthlyOvertime.toFixed(1)}</span>
                    <span className="text-[9px] text-orange-400">ساعات إضافية</span>
                 </div>
            </div>
        </div>

        {/* 4. Weekly Chart */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">الأداء الأسبوعي</h3>
          <EmployeeProfileChart data={chartData} />
        </div>

        {/* 5. Badges */}
        <BadgeGifter employeeId={employeeId} existingBadges={employee.badges} />

      </div>
    </div>
  )
}