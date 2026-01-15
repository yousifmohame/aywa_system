import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  Trophy, CheckSquare, Calendar, Star, 
  TrendingUp, Clock, Package, PhoneIncoming 
} from 'lucide-react'
import TaskItem from '@/app/components/tasks/TaskItem'

export default async function EmployeeDashboard() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  // 1. جلب بيانات الموظف
  const employee = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })

  if (!employee) redirect('/')

  // تحديد نوع القسم
  const isFulfillment = employee.department?.name.includes('تجهيز') || employee.department?.name.includes('تنفيذ')

  // 2. جلب أداء اليوم
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayPerf = await prisma.dailyPerformance.findFirst({
    where: { 
      userId: userId,
      date: { gte: today }
    }
  })

  // 3. حساب الترتيب (Rank)
  // نحسب كم شخص في القسم لديه "سكور" أعلى من الموظف اليوم
  const myScore = todayPerf?.score || 0
  const rankCount = await prisma.dailyPerformance.count({
    where: {
      user: { departmentId: employee.departmentId },
      date: { gte: today },
      score: { gt: myScore }
    }
  })
  const rank = rankCount + 1

  // 4. جلب المهام
  const myTasks = await prisma.task.findMany({
    where: { 
      assignedToId: userId,
      status: { not: 'COMPLETED' } // المهام غير المكتملة فقط
    },
    include: { assignedTo: true },
    orderBy: { dueDate: 'asc' }
  })

  // تجهيز الأرقام للعرض
  const myVolume = isFulfillment ? (todayPerf?.ordersPrepared || 0) : (todayPerf?.callsCount || 0)
  const myTime = isFulfillment ? (todayPerf?.avgPrepTime || 0) : (todayPerf?.avgResponseTime || 0)

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      
      {/* Welcome Card */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* بطاقة الإنتاجية */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">
              {isFulfillment ? 'طلباتك اليوم' : 'مكالماتك اليوم'}
            </p>
            <h3 className="text-3xl font-bold text-blue-600">{myVolume}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            {isFulfillment ? <Package size={24} /> : <PhoneIncoming size={24} />}
          </div>
        </div>

        {/* بطاقة السرعة */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">
              {isFulfillment ? 'متوسط وقت التحضير' : 'متوسط سرعة الرد'}
            </p>
            <h3 className="text-3xl font-bold text-orange-600">
              {myTime} <span className="text-sm font-normal text-gray-400">{isFulfillment ? 'دقيقة' : 'ثانية'}</span>
            </h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
        </div>

        {/* بطاقة المهام */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">مهام معلقة</p>
            <h3 className="text-3xl font-bold text-gray-800">{myTasks.length}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <CheckSquare size={24} />
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          قائمة مهامي
        </h3>

        {myTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTasks.map(task => (
              // يمكن للموظف هنا بدء المهمة أو إنهائها
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