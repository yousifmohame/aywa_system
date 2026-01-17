'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const getCurrentSaudiTime = () => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Riyadh',
    hour12: false, hour: '2-digit', minute: '2-digit'
  })
  let [h, m] = timeString.split(':').map(Number)
  if (h === 24) h = 0
  return { dateObj: now, saudiMinutes: h * 60 + m }
}

export async function employeeAttendanceAction(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 1. جلب بيانات الموظف (لمعرفة مواعيده الخاصة) + الإعدادات العامة
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.systemSettings.findFirst()
  ])

  if (!user || !settings) return { error: 'بيانات غير مكتملة' }

  // 2. تحديد وقت الدوام المعتمد لهذا الموظف
  // الأولوية للوقت الخاص، ثم الوقت العام
  const effectiveStartTimeStr = user.customStartTime || settings.workStartTime
  const effectiveEndTimeStr = user.customEndTime || settings.workEndTime

  const startMinutes = timeToMinutes(effectiveStartTimeStr)
  const endMinutes = timeToMinutes(effectiveEndTimeStr)

  const performance = await prisma.dailyPerformance.findFirst({
    where: { userId, date: { gte: today } }
  })

  const { dateObj, saudiMinutes } = getCurrentSaudiTime()

  // === تسجيل الحضور (Check In) ===
  if (!performance || !performance.checkIn) {
    const ALLOWED_EARLY_MINUTES = 0
    
    if (saudiMinutes < startMinutes - ALLOWED_EARLY_MINUTES) {
        return { error: `لم يبدأ دوامك بعد. موعدك: ${effectiveStartTimeStr}` }
    }

    let statusNote = 'حضور في الوقت'
    let score = 100
    let delayMinutes = 0

    // === حساب التأخير ===
    // إذا حضر بعد وقت البدء + فترة السماح
    if (saudiMinutes > startMinutes + settings.lateThreshold) {
      statusNote = 'تأخير'
      // حساب دقائق التأخير بالضبط
      delayMinutes = saudiMinutes - startMinutes
      
      // خصم درجات (مثلاً درجة لكل دقيقة تأخير بحد أقصى)
      score = Math.max(50, 100 - (delayMinutes / 2)) 
    }

    if (!performance) {
      await prisma.dailyPerformance.create({
        data: { 
            userId, 
            date: dateObj, 
            checkIn: dateObj, 
            rating: statusNote, 
            score,
            delayMinutes // حفظ التأخير
        }
      })
    } else {
      await prisma.dailyPerformance.update({
        where: { id: performance.id },
        data: { checkIn: dateObj, rating: statusNote, score, delayMinutes }
      })
    }
    
    revalidatePath('/dashboard/employee')
    return { success: true, message: `تم تسجيل الحضور (${statusNote}) - تأخير: ${delayMinutes} دقيقة` }
  }

  // === تسجيل الانصراف (Check Out) ===
  else if (performance.checkIn && !performance.checkOut) {
    if (saudiMinutes < endMinutes) {
      return { error: `لا يمكنك الانصراف قبل انتهاء دوامك (${effectiveEndTimeStr})` }
    }

    // حساب الساعات (بناءً على التوقيت الخاص)
    const checkInDate = new Date(performance.checkIn)
    const checkInTimeStr = checkInDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Riyadh', hour12: false, hour: '2-digit', minute: '2-digit'
    })
    const [chH, chM] = checkInTimeStr.split(':').map(Number)
    const checkInSaudiMinutes = chH * 60 + chM

    const effectiveStartCalc = Math.max(checkInSaudiMinutes, startMinutes)
    const workDurationMinutes = saudiMinutes - effectiveStartCalc
    const totalHoursWorked = Math.max(0, workDurationMinutes / 60)

    // حساب الأوفر تايم
    const shiftDuration = (endMinutes - startMinutes) / 60
    let regularHours = totalHoursWorked
    let overtimeHours = 0

    if (user.isOvertimeEnabled && totalHoursWorked > shiftDuration) {
        regularHours = shiftDuration
        overtimeHours = totalHoursWorked - shiftDuration
    } else if (!user.isOvertimeEnabled) {
        regularHours = Math.min(totalHoursWorked, shiftDuration)
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
    return { success: true, message: 'تم تسجيل الانصراف' }
  }
}