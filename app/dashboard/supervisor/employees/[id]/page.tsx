import { prisma } from '@/app/lib/prisma'
import { notFound } from 'next/navigation'
import EmployeeProfileChart from '@/app/components/supervisor/EmployeeProfileChart'
import { Clock, Trophy, Target, Star, TrendingUp, Award, ArrowRight } from 'lucide-react'
import AttendanceCard from '@/app/components/supervisor/AttendanceCard'
import BadgeGifter from '@/app/components/supervisor/BadgeGifter'
import Link from 'next/link'

// دالة تنسيق التاريخ والوقت
const getDayName = (date: Date) => new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)

// 1. تعريف النوع الصحيح لـ params كـ Promise (متطلب Next.js 15)
type Props = {
  params: Promise<{ id: string }>
}

export default async function EmployeeProfilePage(props: Props) {
  // 2. فك الـ Promise
  const params = await props.params
  const employeeId = params.id
  
  // 3. جلب بيانات الموظف الأساسية + عدد المهام المنجزة
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    include: { 
      department: true,
      badges: { orderBy: { createdAt: 'desc' } }, // جلب الأوسمة
      _count: { 
        select: { 
          tasksAssigned: { where: { status: 'COMPLETED' } } 
        } 
      }
    }
  })

  if (!employee) return notFound()

  // 4. إعداد التواريخ
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // 5. جلب بيانات الأداء (للرسم البياني والترتيب)
  const [performances, todayPerf, departmentStats, totalAttendanceDays] = await Promise.all([
    // أداء آخر 7 أيام
    prisma.dailyPerformance.findMany({
      where: { userId: employeeId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    }),
    // أداء اليوم (للحضور والنتيجة الحالية)
    prisma.dailyPerformance.findFirst({
      where: { userId: employeeId, date: { gte: today } }
    }),
    // إحصائيات القسم لحساب الترتيب
    prisma.dailyPerformance.groupBy({
      by: ['userId'],
      where: { 
        date: { gte: startOfMonth },
        user: { departmentId: employee.departmentId } 
      },
      _avg: { score: true }
    }),
    // إجمالي أيام الحضور
    prisma.dailyPerformance.count({ where: { userId: employeeId } })
  ])

  // 6. معالجة البيانات
  
  // أ) تجهيز بيانات الرسم البياني (ملء الأيام المفقودة بأصفار)
  const chartData = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    // البحث عن تقييم يطابق هذا اليوم
    const perf = performances.find(p => new Date(p.date).toDateString() === d.toDateString())
    
    chartData.push({
      name: getDayName(d),
      score: perf?.score || 0
    })
  }

  // ب) حساب الترتيب (Rank)
  const sortedRanks = departmentStats.sort((a, b) => (b._avg.score || 0) - (a._avg.score || 0))
  const myRankIndex = sortedRanks.findIndex(r => r.userId === employeeId)
  const rank = myRankIndex !== -1 ? myRankIndex + 1 : '-'

  // ج) وقت الحضور
  // ملاحظة: بما أننا نستخدم date picker، الوقت غالباً سيكون 12:00 AM إلا إذا تم تعديله.
  const attendanceTime = todayPerf 
    ? new Date(todayPerf.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  // د) عدد المهام المنجزة (من قاعدة البيانات)
  const completedTasksCount = employee._count.tasksAssigned

  return (
    <div className="max-w-md mx-auto h-full flex flex-col font-[Tajawal]" dir="rtl">
      
      {/* زر العودة */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/supervisor" className="p-2 bg-white rounded-full text-gray-500 hover:text-blue-600 shadow-sm transition-colors">
          <ArrowRight size={18} />
        </Link>
        <div>
          <h1 className="text-base font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-[10px] text-gray-500">تفاصيل أداء الموظف</p>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto pb-4 scrollbar-hide">
        
        {/* 1. بطاقة المعلومات الرئيسية */}
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

        {/* 2. قسم الحضور */}
        <AttendanceCard performance={todayPerf} employeeId={employeeId} />

        {/* 3. الرسم البياني */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 mb-2">الأداء الأسبوعي</h3>
          <EmployeeProfileChart data={chartData} />
        </div>

        {/* 4. الإنجازات والوسوم */}
        <BadgeGifter employeeId={employeeId} existingBadges={employee.badges} />

        {/* 5. إحصائيات سريعة */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white shadow-md">
            <TrendingUp size={14} className="mb-1 opacity-80" />
            <div className="text-lg font-bold">{completedTasksCount}</div>
            <div className="text-[9px] opacity-90">مهام مكتملة</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white shadow-md">
            <Award size={14} className="mb-1 opacity-80" />
            <div className="text-lg font-bold">{totalAttendanceDays}</div>
            <div className="text-[9px] opacity-90">أيام حضور</div>
          </div>
        </div>

      </div>
    </div>
  )
}