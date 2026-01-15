'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. تسجيل الحضور والانصراف (المصحح)
export async function toggleAttendanceAction(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const performance = await prisma.dailyPerformance.findFirst({
      where: { userId, date: { gte: today } }
    })

    if (!performance) {
      // الحالة 1: لا يوجد سجل نهائياً -> ننشئ سجل جديد ونسجل دخول
      await prisma.dailyPerformance.create({
        data: {
          userId,
          date: new Date(),
          checkIn: new Date(),
          score: 0, 
          rating: 'N/A'
        }
      })
    } 
    else if (!performance.checkIn) {
      // الحالة 2 (الإصلاح): السجل موجود (ربما تم التقييم) ولكن لم يسجل حضور -> نحدث وقت الدخول
      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: { checkIn: new Date() }
      })
    }
    else if (!performance.checkOut) {
      // الحالة 3: مسجل دخول ولم يخرج -> نسجل خروج ونحسب الساعات
      const checkOutTime = new Date()
      // حساب الفرق بالملي ثانية
      const durationMs = checkOutTime.getTime() - new Date(performance.checkIn).getTime()
      // تحويل لساعات (مع التأكد أن الرقم موجب)
      const hours = Math.max(0, durationMs / (1000 * 60 * 60))

      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: {
          checkOut: checkOutTime,
          workHours: parseFloat(hours.toFixed(2))
        }
      })
    }
    else if (performance.checkIn && !performance.checkOut) {
      const checkOutTime = new Date()
      
      // 1. حساب المدة الكلية بالساعات
      const durationMs = checkOutTime.getTime() - new Date(performance.checkIn).getTime()
      const totalHours = Math.max(0, durationMs / (1000 * 60 * 60))

      // 2. جلب إعدادات الموظف لمعرفة هل الأوفر تايم مفعل له؟
      const user = await prisma.user.findUnique({ 
          where: { id: userId },
          select: { isOvertimeEnabled: true }
      })

      // 3. تقسيم الساعات (عادي vs أوفر تايم)
      const STANDARD_SHIFT = 8 // عدد ساعات العمل الرسمي
      let regularHours = totalHours
      let overtimeHours = 0

      // إذا عمل أكثر من 8 ساعات وكان الأوفر تايم مفعلاً له
      if (user?.isOvertimeEnabled && totalHours > STANDARD_SHIFT) {
        regularHours = STANDARD_SHIFT
        overtimeHours = totalHours - STANDARD_SHIFT
      }

      // 4. الحفظ في قاعدة البيانات
      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: {
          checkOut: checkOutTime,
          workHours: parseFloat(regularHours.toFixed(2)),
          overtimeHours: parseFloat(overtimeHours.toFixed(2)) // الحقل الجديد
        }
      })
    }

    // تحديث الصفحة الحالية للموظف
    revalidatePath(`/dashboard/supervisor/employees/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Attendance Error:", error)
    return { error: 'حدث خطأ في تسجيل الحضور' }
  }
}

// ... دالة الأوسمة تبقى كما هي ...
export async function giveBadgeAction(userId: string, badgeType: string, note: string) {
    // ...
    try {
        await prisma.userBadge.create({
          data: { userId, badgeType, note }
        })
        revalidatePath(`/dashboard/supervisor/employees/${userId}`)
        return { success: true }
      } catch (error) {
        return { error: 'فشل منح الوسام' }
      }
}