'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateEvaluationSettingsAction(formData: FormData) {
  const departmentId = formData.get('departmentId') as string
  const speed = parseInt(formData.get('speed') as string)
  const accuracy = parseInt(formData.get('accuracy') as string)
  const quality = parseInt(formData.get('quality') as string)
  const discipline = parseInt(formData.get('discipline') as string)

  // التحقق من أن المجموع 100%
  if (speed + accuracy + quality + discipline !== 100) {
    return { error: 'يجب أن يكون مجموع النسب 100% تماماً' }
  }

  try {
    await prisma.evaluationSetting.upsert({
      where: { departmentId },
      update: {
        speedWeight: speed,
        accuracyWeight: accuracy,
        qualityWeight: quality,
        disciplineWeight: discipline
      },
      create: {
        departmentId,
        speedWeight: speed,
        accuracyWeight: accuracy,
        qualityWeight: quality,
        disciplineWeight: discipline
      }
    })

    revalidatePath('/dashboard/settings/evaluations')
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء حفظ الإعدادات' }
  }
}