'use client'

import { updateTaskStatusAction, deleteTaskAction } from '@/app/actions/tasks'
import { Clock, Calendar, Trash2, CheckCircle2, PlayCircle } from 'lucide-react'
import { useState } from 'react'

export default function TaskItem({ task, canManage }: { task: any, canManage: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if(!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return
    setIsDeleting(true)
    await deleteTaskAction(task.id)
  }

  const handleStatusChange = async (newStatus: string) => {
    await updateTaskStatusAction(task.id, newStatus)
  }

  // تحديد ألوان البطاقة حسب الحالة
  const statusColors = {
    PENDING: 'border-l-4 border-l-orange-400',
    IN_PROGRESS: 'border-l-4 border-l-blue-500',
    COMPLETED: 'border-l-4 border-l-green-500 opacity-70'
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 transition-all hover:shadow-md ${statusColors[task.status as keyof typeof statusColors]}`}>
      
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.title}
        </h4>
        {canManage && (
          <button onClick={handleDelete} disabled={isDeleting} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[8px]">
                {task.assignedTo.fullName.charAt(0)}
            </div>
            <span>{task.assignedTo.fullName}</span>
        </div>
        {task.dueDate && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                <Calendar size={10} />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
            </div>
        )}
      </div>

      {/* أزرار التحكم في الحالة */}
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
            <button 
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
                <PlayCircle size={14} /> ابدأ العمل
            </button>
        )}
        
        {task.status === 'IN_PROGRESS' && (
            <button 
                onClick={() => handleStatusChange('COMPLETED')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
            >
                <CheckCircle2 size={14} /> إكمال المهمة
            </button>
        )}

        {task.status === 'COMPLETED' && (
            <span className="flex-1 text-center text-xs font-bold text-green-600 py-1.5">
                ✅ تم الإنجاز
            </span>
        )}
      </div>
    </div>
  )
}