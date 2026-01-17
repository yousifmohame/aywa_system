import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  Trophy, CheckSquare, Calendar, Star, 
  Package, PhoneIncoming, Timer, History, Zap 
} from 'lucide-react'
import TaskItem from '@/app/components/tasks/TaskItem'
import AttendanceCard from '@/app/components/dashboard/AttendanceCard' // استيراد المكون الجديد

export default async function EmployeeDashboard() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  // 1. إعداد التواريخ
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // 2. جلب البيانات دفعة واحدة (Parallel Fetching)
  const [employee, todayPerf, settings, monthlyStats, myTasks, rankCount] = await Promise.all([
    // أ) بيانات الموظف
    prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    }),

    // ب) أداء اليوم (للحضور والإنتاجية)
    prisma.dailyPerformance.findFirst({
      where: { userId: userId, date: { gte: today } }
    }),

    // ج) إعدادات النظام (لمعرفة مواعيد العمل)
    prisma.systemSettings.findUnique({ where: { id: 'settings' } }),

    // د) إحصائيات الشهر (ساعات العمل والأوفر تايم)
    prisma.dailyPerformance.aggregate({
        where: { userId: userId, date: { gte: startOfMonth } },
        _sum: { workHours: true, overtimeHours: true }
    }),

    // هـ) المهام
    prisma.task.findMany({
      where: { assignedToId: userId, status: { not: 'COMPLETED' } },
      include: { assignedTo: true },
      orderBy: { dueDate: 'asc' }
    }),

    // و) حساب الترتيب (سيتم جلبه لاحقاً لعدم تعقيد الـ Promise)
    // *ملاحظة: للحصول على الترتيب بدقة نحتاج لخطوة إضافية، سنقوم بها بالأسفل*
    Promise.resolve(0) 
  ])

  if (!employee) redirect('/')

  // حساب الترتيب بشكل منفصل (لأنه يعتمد على سكور اليوم)
  const myScore = todayPerf?.score || 0
  const realRankCount = await prisma.dailyPerformance.count({
    where: {
      user: { departmentId: employee.departmentId },
      date: { gte: today },
      score: { gt: myScore }
    }
  })
  const rank = realRankCount + 1

  // تحديد نوع القسم
  const isFulfillment = employee.department?.name.includes('تجهيز') || employee.department?.name.includes('تنفيذ')

  // تجهيز الأرقام للعرض
  const myVolume = isFulfillment ? (todayPerf?.ordersPrepared || 0) : (todayPerf?.callsCount || 0)
  const myTime = isFulfillment ? (todayPerf?.avgPrepTime || 0) : (todayPerf?.avgResponseTime || 0)
  
  // أرقام الساعات
  const todayHours = todayPerf?.workHours || 0
  const monthlyHours = monthlyStats._sum.workHours || 0
  const monthlyOvertime = monthlyStats._sum.overtimeHours || 0

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* 1. Welcome Card */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">أهلاً، {employee.fullName.split(' ')[0]} 👋</h1>
          <p className="text-blue-200 text-sm">
            {myScore >= 90 ? 'أداء ممتاز! استمر هكذا 🚀' : 'يوم جديد لتحقيق الأهداف ✨'}
          </p>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-center min-w-[100px]">
          <span className="text-[10px] text-blue-200 block mb-1">ترتيبك اليوم</span>
          <div className="flex items-center justify-center gap-1 text-3xl font-bold text-yellow-400">
            <Trophy size={24} />
            <span>{rank}</span>
          </div>
        </div>
        <Star className="absolute left-[-20px] bottom-[-20px] text-white/5" size={150} />
      </div>

      {/* 2. Attendance & Time Stats Grid (الجديد) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* بطاقة تسجيل الحضور (تفاعلية) */}
          <AttendanceCard userId={userId} todayPerf={todayPerf} settings={settings} />

          {/* بطاقة ساعات العمل (شهرية ويومية) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><History size={18} /></div>
                <h3 className="font-bold text-gray-800 text-sm">ساعات العمل</h3>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500">اليوم</span>
                    <span className="text-xl font-bold text-gray-800">{todayHours} <span className="text-xs font-normal">ساعة</span></span>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500">هذا الشهر</span>
                    <span className="text-xl font-bold text-blue-600">{monthlyHours.toFixed(1)} <span className="text-xs font-normal text-gray-500">ساعة</span></span>
                </div>
             </div>
          </div>

          {/* بطاقة الأوفر تايم */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-xl shadow-md text-white flex flex-col justify-between h-full relative overflow-hidden">
             <div className="relative z-10 flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/20 rounded-lg"><Zap size={18} className="text-yellow-300" /></div>
                <h3 className="font-bold text-white text-sm">الأوفر تايم (شهري)</h3>
             </div>
             <div className="relative z-10 mt-2">
                <div className="text-4xl font-bold text-white mb-1">
                    {monthlyOvertime.toFixed(1)}
                </div>
                <p className="text-[10px] text-indigo-200">ساعات إضافية تم احتسابها</p>
             </div>
             <Zap className="absolute -bottom-4 -left-4 text-white/10 rotate-12" size={100} />
          </div>
      </div>

      {/* 3. Productivity Stats Grid (القديم) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* الإنتاجية */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">
              {isFulfillment ? 'طلباتك اليوم' : 'مكالماتك اليوم'}
            </p>
            <h3 className="text-3xl font-bold text-gray-800">{myVolume}</h3>
          </div>
          <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
            {isFulfillment ? <Package size={24} /> : <PhoneIncoming size={24} />}
          </div>
        </div>

        {/* السرعة */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">
              {isFulfillment ? 'متوسط الوقت' : 'سرعة الرد'}
            </p>
            <h3 className="text-3xl font-bold text-orange-600">
              {myTime} <span className="text-sm font-normal text-gray-400">{isFulfillment ? 'دقيقة' : 'ثانية'}</span>
            </h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Timer size={24} />
          </div>
        </div>

        {/* المهام */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">مهام معلقة</p>
            <h3 className="text-3xl font-bold text-gray-800">{myTasks.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckSquare size={24} />
          </div>
        </div>
      </div>

      {/* 4. Tasks Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          قائمة مهامي
        </h3>

        {myTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTasks.map(task => (
              <TaskItem key={task.id} task={task} canManage={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
              <CheckSquare className="text-green-500" />
            </div>
            <h4 className="text-gray-900 font-bold">رائع! لا توجد مهام جديدة</h4>
            <p className="text-xs text-gray-500 mt-1">يمكنك التركيز على زيادة إنتاجيتك الآن.</p>
          </div>
        )}
      </div>

    </div>
  )
}