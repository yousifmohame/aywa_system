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

export async function updateSettingsAction(formData: FormData) {
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  
  // يمكن إضافة فترة السماح أيضاً إذا كانت موجودة في الفورم
  // const lateThreshold = Number(formData.get('lateThreshold') || 15)

  if (!startTime || !endTime) {
    return { error: 'يرجى تحديد أوقات الحضور والانصراف' }
  }

  try {
    // نستخدم upsert لضمان وجود إعدادات (إنشاء إذا لم توجد، تحديث إذا وجدت)
    await prisma.systemSettings.upsert({
      where: { id: 'settings' },
      update: {
        workStartTime: startTime,
        workEndTime: endTime,
      },
      create: {
        id: 'settings',
        workStartTime: startTime,
        workEndTime: endTime,
        lateThreshold: 15
      }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/settings/worktime') // في حال كانت صفحة منفصلة
    return { success: true, message: 'تم حفظ إعدادات الدوام بنجاح' }
  } catch (error) {
    console.error('Settings Error:', error)
    return { error: 'فشل حفظ الإعدادات' }
  }
}