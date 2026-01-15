import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import AddTaskModal from '@/app/components/tasks/AddTaskModal'
import TasksBoard from '@/app/components/tasks/TasksBoard' // استدعاء المكون الجديد
import { CheckSquare } from 'lucide-react'

export default async function TasksPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const userRole = cookieStore.get('userRole')?.value

  const isManager = userRole === 'MANAGER'
  const isSupervisor = userRole === 'SUPERVISOR'
  
  let whereClause = {}

  if (isSupervisor) {
    const supervisor = await prisma.user.findUnique({ where: { id: userId } })
    whereClause = { assignedTo: { departmentId: supervisor?.departmentId } }
  } else if (!isManager && !isSupervisor) {
    whereClause = { assignedToId: userId }
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: { assignedTo: true },
    orderBy: { createdAt: 'desc' }
  })

  // جلب الموظفين للإسناد
  let employees: any[] = []
  if (isManager || isSupervisor) {
    employees = await prisma.user.findMany({
        where: { 
            role: 'EMPLOYEE',
            ...(isSupervisor ? { departmentId: (await prisma.user.findUnique({where:{id:userId}}))?.departmentId } : {})
        },
        include: { department: true }
    })
  }

  // فصل البيانات هنا في السيرفر
  const pendingTasks = tasks.filter(t => t.status === 'PENDING')
  const progressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    // استخدام h-[calc(100vh-85px)] لضمان ملء الشاشة على الموبايل بدون سكرول خارجي
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-120px)] flex flex-col font-[Tajawal]" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="text-blue-600" size={20} />
            إدارة المهام
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1 hidden md:block">
            متابعة سير العمل وتوزيع المهام على الفريق
          </p>
        </div>
        
        {(isManager || isSupervisor) && (
            <AddTaskModal employees={employees} />
        )}
      </div>

      {/* استدعاء مكون اللوحة المتجاوب */}
      <TasksBoard 
        pendingTasks={pendingTasks}
        progressTasks={progressTasks}
        completedTasks={completedTasks}
        canManage={isManager || isSupervisor}
      />

    </div>
  )
}