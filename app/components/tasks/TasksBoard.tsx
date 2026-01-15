'use client'

import { useState } from 'react'
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react'
import TaskItem from '@/app/components/tasks/TaskItem'

type Props = {
  pendingTasks: any[]
  progressTasks: any[]
  completedTasks: any[]
  canManage: boolean
}

export default function TasksBoard({ pendingTasks, progressTasks, completedTasks, canManage }: Props) {
  // حالة التبويب النشط للموبايل (افتراضياً: قيد الانتظار)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PROGRESS' | 'COMPLETED'>('PENDING')

  return (
    <div className="flex flex-col h-full">
      
      {/* 1. Mobile Tabs Switcher (يظهر فقط في الموبايل) */}
      <div className="md:hidden flex p-1 bg-gray-100 rounded-lg mb-4 mx-1">
        <TabButton 
          label="الانتظار" 
          count={pendingTasks.length}
          isActive={activeTab === 'PENDING'} 
          onClick={() => setActiveTab('PENDING')}
          activeColor="bg-white text-orange-600 shadow-sm"
          icon={Clock}
        />
        <TabButton 
          label="جاري العمل" 
          count={progressTasks.length}
          isActive={activeTab === 'PROGRESS'} 
          onClick={() => setActiveTab('PROGRESS')}
          activeColor="bg-white text-blue-600 shadow-sm"
          icon={PlayCircle}
        />
        <TabButton 
          label="المكتملة" 
          count={completedTasks.length}
          isActive={activeTab === 'COMPLETED'} 
          onClick={() => setActiveTab('COMPLETED')}
          activeColor="bg-white text-green-600 shadow-sm"
          icon={CheckCircle2}
        />
      </div>

      {/* 2. Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-hidden min-h-0">
        
        {/* Column 1: Pending */}
        <div className={`${activeTab === 'PENDING' ? 'block' : 'hidden'} md:block h-full overflow-hidden`}>
          <TaskColumn 
            title="قيد الانتظار" 
            count={pendingTasks.length} 
            icon={Clock} 
            color="bg-orange-50 text-orange-700" 
            borderColor="border-orange-200"
          >
            {pendingTasks.map((task: any) => (
              <TaskItem key={task.id} task={task} canManage={canManage} />
            ))}
          </TaskColumn>
        </div>

        {/* Column 2: In Progress */}
        <div className={`${activeTab === 'PROGRESS' ? 'block' : 'hidden'} md:block h-full overflow-hidden`}>
          <TaskColumn 
            title="جاري العمل" 
            count={progressTasks.length} 
            icon={PlayCircle} 
            color="bg-blue-50 text-blue-700" 
            borderColor="border-blue-200"
          >
            {progressTasks.map((task: any) => (
              <TaskItem key={task.id} task={task} canManage={canManage} />
            ))}
          </TaskColumn>
        </div>

        {/* Column 3: Completed */}
        <div className={`${activeTab === 'COMPLETED' ? 'block' : 'hidden'} md:block h-full overflow-hidden`}>
          <TaskColumn 
            title="تم الإنجاز" 
            count={completedTasks.length} 
            icon={CheckCircle2} 
            color="bg-green-50 text-green-700" 
            borderColor="border-green-200"
          >
            {completedTasks.map((task: any) => (
              <TaskItem key={task.id} task={task} canManage={canManage} />
            ))}
          </TaskColumn>
        </div>

      </div>
    </div>
  )
}

// مكون الزر الخاص بالموبايل
function TabButton({ label, count, isActive, onClick, activeColor, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-bold transition-all duration-200
        ${isActive ? activeColor : 'text-gray-500 hover:bg-gray-200/50'}`}
    >
      <Icon size={14} />
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-gray-100' : 'bg-gray-200'}`}>
        {count}
      </span>
    </button>
  )
}

// مكون العمود (تم تحسينه قليلاً للتمرير)
function TaskColumn({ title, count, icon: Icon, color, borderColor, children }: any) {
  return (
    <div className={`flex flex-col h-full bg-gray-50/50 md:bg-gray-50/50 rounded-xl border ${borderColor} overflow-hidden shadow-sm`}>
      <div className={`p-3 flex items-center justify-between border-b ${borderColor} ${color} bg-opacity-20`}>
        <div className="flex items-center gap-2 font-bold text-sm">
          <Icon size={16} />
          {title}
        </div>
        <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide space-y-3">
        {children}
        {count === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <Icon size={40} className="mb-2 opacity-20" />
            <p className="text-xs">لا توجد مهام</p>
          </div>
        )}
      </div>
    </div>
  )
}