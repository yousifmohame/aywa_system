'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// دالة مساعدة لتحويل "09:00" إلى دقائق (540)
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// دالة لتحويل كائن التاريخ إلى دقائق منذ بداية اليوم
const dateToMinutes = (date: Date) => {
  return date.getHours() * 60 + date.getMinutes()
}

export async function employeeAttendanceAction(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // بداية اليوم 00:00
  
  // 1. جلب الإعدادات
  const settings = await prisma.systemSettings.findFirst()
  if (!settings) return { error: 'لم يتم ضبط إعدادات النظام' }

  const performance = await prisma.dailyPerformance.findFirst({
    where: { userId, date: { gte: today } }
  })

  // === منطق تسجيل الحضور (Check In) ===
  if (!performance || !performance.checkIn) {
    const now = new Date()
    const nowMinutes = dateToMinutes(now)
    const startMinutes = timeToMinutes(settings.workStartTime)
    
    // أ) منع الحضور المبكر جداً (قبل الموعد بـ 30 دقيقة مثلاً)
    const ALLOWED_EARLY_MINUTES = 0 
    if (nowMinutes < startMinutes - ALLOWED_EARLY_MINUTES) {
        return { 
            error: `عذراً، لم يبدأ الدوام بعد. يمكنك تسجيل الحضور بدءاً من ${settings.workStartTime} ` 
        }
    }

    // ب) تحديد حالة التأخير
    let statusNote = 'حضور في الوقت'
    let score = 100 // درجة افتراضية للحضور

    // إذا تأخر أكثر من فترة السماح
    if (nowMinutes > startMinutes + settings.lateThreshold) {
      statusNote = 'تأخير'
      score = 80 // خصم درجات بسبب التأخير
    }

    if (!performance) {
      await prisma.dailyPerformance.create({
        data: { userId, date: new Date(), checkIn: new Date(), rating: statusNote, score }
      })
    } else {
      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: { checkIn: new Date(), rating: statusNote, score }
      })
    }
    
    revalidatePath('/dashboard/employee')
    return { success: true, message: `تم تسجيل الحضور (${statusNote})` }
  }

  // === منطق تسجيل الانصراف (Check Out) ===
  else if (performance.checkIn && !performance.checkOut) {
    const now = new Date()
    const nowMinutes = dateToMinutes(now)
    const endMinutes = timeToMinutes(settings.workEndTime)
    const startMinutes = timeToMinutes(settings.workStartTime)

    // أ) منع الانصراف المبكر
    if (nowMinutes < endMinutes) {
      return { 
        error: `عذراً، لا يمكنك تسجيل الانصراف قبل انتهاء الدوام الرسمي (${settings.workEndTime})` 
      }
    }

    // ب) حساب ساعات العمل "الصافية"
    // القاعدة: إذا حضر الموظف قبل الموعد، نحسب الساعات من "وقت الدوام الرسمي"
    // وإذا حضر متأخراً، نحسب من "وقت وصوله الفعلي"
    const checkInMinutes = dateToMinutes(performance.checkIn)
    
    // البداية الفعلية للمحاسبة = الأكبر بين (وقت الحضور الفعلي) و (وقت بداية الدوام)
    const effectiveStartMinutes = Math.max(checkInMinutes, startMinutes)
    
    // مدة العمل بالدقائق = وقت الانصراف الفعلي - وقت البداية المحاسبي
    const workDurationMinutes = nowMinutes - effectiveStartMinutes
    const totalHoursWorked = workDurationMinutes / 60

    // ج) حساب الأوفر تايم
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const officialShiftDuration = (endMinutes - startMinutes) / 60 // مثلاً 8 ساعات

    let regularHours = totalHoursWorked
    let overtimeHours = 0

    // إذا كان الموظف مفعلاً له الأوفر تايم وعمل ساعات أكثر من الشيفت الرسمي
    if (user?.isOvertimeEnabled && totalHoursWorked > officialShiftDuration) {
        regularHours = officialShiftDuration
        overtimeHours = totalHoursWorked - officialShiftDuration
    } else {
        // إذا لم يكن لديه أوفر تايم، نحدد السقف بساعات الشيفت (حتى لو جلس بعد الدوام)
        // إلا إذا كنت تريد حساب بقائه كعمل عادي بدون أجر إضافي، اتركها كما هي. 
        // هنا سنقوم بتحديد السقف لعدم التلاعب:
        if (!user?.isOvertimeEnabled) {
            regularHours = Math.min(totalHoursWorked, officialShiftDuration)
        }
    }

    await prisma.dailyPerformance.update({
      where: { id: performance.id },
      data: {
        checkOut: new Date(),
        workHours: parseFloat(regularHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2))
      }
    })

    revalidatePath('/dashboard/employee')
    return { success: true, message: 'تم تسجيل الانصراف وحساب الساعات بنجاح' }
  }
}