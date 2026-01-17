'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. دالة مساعدة لتحويل وقت النص (مثال 09:00) إلى دقائق
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 2. دالة جديدة للحصول على الوقت الحالي في السعودية حصراً
const getCurrentSaudiTime = () => {
  const now = new Date()
  
  // تحويل الوقت الحالي إلى توقيت السعودية (الرياض)
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Riyadh', // <--- التغيير هنا
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
  
  let [h, m] = timeString.split(':').map(Number)
  if (h === 24) h = 0

  return {
    dateObj: now, 
    saudiMinutes: h * 60 + m // الدقائق بتوقيت السعودية
  }
}

export async function employeeAttendanceAction(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const settings = await prisma.systemSettings.findFirst()
  if (!settings) return { error: 'لم يتم ضبط إعدادات النظام' }

  const performance = await prisma.dailyPerformance.findFirst({
    where: { userId, date: { gte: today } }
  })

  // === جلب توقيت السعودية الحالي ===
  const { dateObj, saudiMinutes } = getCurrentSaudiTime()
  const startMinutes = timeToMinutes(settings.workStartTime)
  const endMinutes = timeToMinutes(settings.workEndTime)

  // === منطق تسجيل الحضور (Check In) ===
  if (!performance || !performance.checkIn) {
    
    // السماح بالدخول قبل الموعد بـ 30 دقيقة
    const ALLOWED_EARLY_MINUTES = 0

    // الشرط: هل الوقت الحالي في السعودية أقل من (بداية الدوام - 30 دقيقة)؟
    if (saudiMinutes < startMinutes - ALLOWED_EARLY_MINUTES) {
        return { 
            error: `عذراً، لم يبدأ الدوام بعد. يمكنك تسجيل الحضور بدءاً من ${settings.workStartTime}` 
        }
    }

    let statusNote = 'حضور في الوقت'
    let score = 100

    // التأخير: هل الوقت الحالي أكبر من وقت البدء + فترة السماح؟
    if (saudiMinutes > startMinutes + settings.lateThreshold) {
      statusNote = 'تأخير'
      score = 80
    }

    if (!performance) {
      await prisma.dailyPerformance.create({
        data: { userId, date: dateObj, checkIn: dateObj, rating: statusNote, score }
      })
    } else {
      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: { checkIn: dateObj, rating: statusNote, score }
      })
    }
    
    revalidatePath('/dashboard/employee')
    return { success: true, message: `تم تسجيل الحضور (${statusNote})` }
  }

  // === منطق تسجيل الانصراف (Check Out) ===
  else if (performance.checkIn && !performance.checkOut) {
    
    // منع الانصراف المبكر
    if (saudiMinutes < endMinutes) {
      return { 
        error: `عذراً، لا يمكنك تسجيل الانصراف قبل انتهاء الدوام الرسمي (${settings.workEndTime})` 
      }
    }

    // === حساب الساعات بدقة ===
    // نحتاج لمعرفة وقت الحضور بالدقائق (بتوقيت السعودية)
    const checkInDate = new Date(performance.checkIn)
    const checkInTimeString = checkInDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Riyadh', // <--- التغيير هنا أيضاً لحساب الفرق بشكل صحيح
        hour12: false, hour: '2-digit', minute: '2-digit'
    })
    const [chH, chM] = checkInTimeString.split(':').map(Number)
    const checkInSaudiMinutes = chH * 60 + chM

    // نقطة بداية الحساب: الأكبر بين (وقت الحضور الفعلي) و (وقت بداية الدوام الرسمي)
    const effectiveStartMinutes = Math.max(checkInSaudiMinutes, startMinutes)
    
    // مدة العمل = وقت الانصراف الحالي - وقت البداية الفعال
    const workDurationMinutes = saudiMinutes - effectiveStartMinutes
    const totalHoursWorked = Math.max(0, workDurationMinutes / 60)

    // حساب الأوفر تايم
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const officialShiftDuration = (endMinutes - startMinutes) / 60

    let regularHours = totalHoursWorked
    let overtimeHours = 0

    if (user?.isOvertimeEnabled && totalHoursWorked > officialShiftDuration) {
        regularHours = officialShiftDuration
        overtimeHours = totalHoursWorked - officialShiftDuration
    } else {
        if (!user?.isOvertimeEnabled) {
            regularHours = Math.min(totalHoursWorked, officialShiftDuration)
        }
    }

    await prisma.dailyPerformance.update({
      where: { id: performance.id },
      data: {
        checkOut: dateObj,
        workHours: parseFloat(regularHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2))
      }
    })

    revalidatePath('/dashboard/employee')
    return { success: true, message: 'تم تسجيل الانصراف وحساب الساعات بنجاح' }
  }
}