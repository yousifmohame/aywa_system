'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. إنشاء مهمة جديدة
export async function createTaskAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assignedToId = formData.get('assignedToId') as string
  const dueDateStr = formData.get('dueDate') as string

  if (!title || !assignedToId) {
    return { error: 'عنوان المهمة والموظف المسؤول حقول مطلوبة' }
  }

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        assignedToId,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        status: 'PENDING'
      }
    })

    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    return { error: 'فشل إنشاء المهمة' }
  }
}

// 2. تحديث حالة المهمة (للموظف)
export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    })
    
    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/employee') // لتحديث عداد المهام في لوحة الموظف
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث الحالة' }
  }
}

// 3. حذف المهمة
export async function deleteTaskAction(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId }
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    return { error: 'فشل حذف المهمة' }
  }
}