'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleOvertimeAction(userId: string, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOvertimeEnabled: !currentStatus }
    })
    
    revalidatePath('/dashboard/manager')
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث الحالة' }
  }
}