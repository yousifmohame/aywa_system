'use server'

import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'

export async function getUnreadTasksCount() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) return 0

  try {
    // حساب عدد المهام المعلقة المسندة لهذا المستخدم
    const count = await prisma.task.count({
      where: {
        assignedToId: userId,
        status: 'PENDING' // نعد فقط المهام التي لم يبدأ العمل عليها
      }
    })
    return count
  } catch (error) {
    return 0
  }
}