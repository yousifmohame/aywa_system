"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// دالة مساعدة لتحويل الوقت (09:00) إلى دقائق لسهولة الحساب
const timeToMinutes = (time: string | null | undefined) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
// ==========================================
// 🚀 محرك التقييم الذكي التلقائي (المتكامل مع الحضور)
// ==========================================
export async function runAutoEvaluationsAction(dateStr: string) {
  try {
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    // 1. جلب إعدادات النظام العامة (لمعرفة وقت الحضور الرسمي وفترة السماح)
    const systemSettings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const defaultStartTime = systemSettings?.workStartTime || "09:00";
    const lateThreshold = systemSettings?.lateThreshold || 15; // فترة السماح بالدقائق

    // 2. جلب جميع الموظفين النشطين مع بياناتهم وأدائهم اليوم
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      include: {
        department: { include: { evaluationSettings: true } },
        // جلب الشكاوى والمهام
        tasksAssigned: {
          where: { updatedAt: { gte: startDate, lte: endDate } },
        },
        assignedComplaints: {
          where: { updatedAt: { gte: startDate, lte: endDate } },
        },
        // جلب سجل حضور الموظف في هذا اليوم تحديداً
        performances: {
          where: { date: { gte: startDate, lte: endDate } },
          take: 1,
        },
      },
    });

    for (const emp of employees) {
      const settings = emp.department?.evaluationSettings || {
        speedWeight: 30,
        accuracyWeight: 30,
        qualityWeight: 20,
        disciplineWeight: 20,
        dailyTarget: 20,
      };

      // سجل الحضور والانصراف الحالي
      const todayPerf = emp.performances[0];

      // --- أ. حساب الأرقام التشغيلية ---
      const solvedComplaints = emp.assignedComplaints.filter(
        (c) => c.status === "SOLVED",
      ).length;
      const completedTasks = emp.tasksAssigned.filter(
        (t) => t.status === "COMPLETED",
      ).length;
      const totalCompleted = solvedComplaints + completedTasks;
      const totalAssignedToday =
        emp.assignedComplaints.length + emp.tasksAssigned.length;

      // --- ب. حساب درجات الذكاء الاصطناعي ---

      // 1. السرعة
      let speedScore = 0;
      if (settings.dailyTarget > 0) {
        speedScore = Math.min(
          100,
          Math.round((totalCompleted / settings.dailyTarget) * 100),
        );
      }

      // 2. الجودة والدقة
      let qualityScore = 100;
      if (totalAssignedToday > 0) {
        qualityScore = Math.round((totalCompleted / totalAssignedToday) * 100);
      }
      let accuracyScore = qualityScore;

      // 3. الانضباط (الذكاء الاصطناعي للحضور والانصراف) 🔥
      let disciplineScore = 100; // الدرجة النهائية تبدأ من 100
      let delayMinutes = 0;

      if (!todayPerf || !todayPerf.checkIn) {
        // إذا لم يسجل حضور أصلاً (غائب)
        disciplineScore = 0;
      } else {
        // إذا كان حاضراً، نحسب التأخير بناءً على موعده الخاص أو العام
        const expectedStartTime = emp.customStartTime || defaultStartTime;
        const [expectedHour, expectedMinute] = expectedStartTime
          .split(":")
          .map(Number);

        // تحويل وقت حضوره الفعلي إلى ساعات ودقائق
        const actualCheckIn = new Date(todayPerf.checkIn);
        const actualHour = actualCheckIn.getHours();
        const actualMinute = actualCheckIn.getMinutes();

        // حساب الفرق بالدقائق
        const expectedTotalMinutes = expectedHour * 60 + expectedMinute;
        const actualTotalMinutes = actualHour * 60 + actualMinute;

        const diffMinutes = actualTotalMinutes - expectedTotalMinutes;

        // إذا تأخر أكثر من فترة السماح
        if (diffMinutes > lateThreshold) {
          delayMinutes = diffMinutes;
          // معادلة الخصم: خصم درجة عن كل دقيقة تأخير (أو يمكنك تغييرها حسب سياسة شركتك)
          disciplineScore = Math.max(0, 100 - (delayMinutes - lateThreshold));
        }
      }

      // --- ج. حساب النتيجة النهائية המوزونة ---
      const finalScore = Math.round(
        (speedScore * settings.speedWeight) / 100 +
          (accuracyScore * settings.accuracyWeight) / 100 +
          (qualityScore * settings.qualityWeight) / 100 +
          (disciplineScore * settings.disciplineWeight) / 100,
      );

      // --- د. التقييم اللفظي ---
      let ratingText = "ضعيف";
      if (finalScore >= 90) ratingText = "ممتاز";
      else if (finalScore >= 80) ratingText = "جيد جداً";
      else if (finalScore >= 70) ratingText = "جيد";
      else if (finalScore > 0) ratingText = "مقبول";
      else if (disciplineScore === 0 && totalCompleted === 0)
        ratingText = "غائب";

      const isFulfillment =
        emp.department?.name?.includes("تجهيز") ||
        emp.department?.name?.includes("تنفيذ");

      // --- حساب الانصراف والساعات تلقائياً ---
      const effectiveEndTimeStr = emp.customEndTime || defaultStartTime.replace('09', '17'); // افتراضي 5 مساءً
      const [endH, endM] = effectiveEndTimeStr.split(':').map(Number);
      
      // إنشاء كائن تاريخ لوقت الانصراف المفترض اليوم
      const autoCheckOutDate = new Date(startDate);
      autoCheckOutDate.setHours(endH, endM, 0, 0);

      let workHours = 0;
      let overtimeHours = 0;

      if (todayPerf && todayPerf.checkIn) {
        const checkInDate = new Date(todayPerf.checkIn);
        
        // حساب مدة العمل الفعلية بالدقائق (من وقت الدخول حتى وقت انتهاء الدوام الرسمي)
        const durationMs = autoCheckOutDate.getTime() - checkInDate.getTime();
        const durationHours = Math.max(0, durationMs / (1000 * 60 * 60));

        // حساب الدوام الرسمي (مثلاً 8 ساعات)
        const shiftDuration = (timeToMinutes(effectiveEndTimeStr) - timeToMinutes(emp.customStartTime || defaultStartTime)) / 60;

        if (emp.isOvertimeEnabled && durationHours > shiftDuration) {
          workHours = shiftDuration;
          overtimeHours = durationHours - shiftDuration;
        } else {
          workHours = Math.min(durationHours, shiftDuration);
        }
      }

      // --- هـ. الحفظ التلقائي في قاعدة البيانات ---
      await prisma.dailyPerformance.upsert({
        where: {
          userId_date: { userId: emp.id, date: startDate },
        },
        update: {
          checkOut: autoCheckOutDate,
          workHours: parseFloat(workHours.toFixed(2)),
          overtimeHours: parseFloat(overtimeHours.toFixed(2)),
          score: finalScore,
          rating: ratingText,
          speedScore,
          qualityScore,
          disciplineScore,
          accuracyRate: accuracyScore,
          delayMinutes, // حفظ دقائق التأخير التي حسبناها

          ordersPrepared: isFulfillment ? totalCompleted : 0,
          callsCount: !isFulfillment ? totalCompleted : 0,
          solvedTickets: !isFulfillment ? solvedComplaints : 0,
        },
        create: {
          userId: emp.id,
          date: startDate,
          score: finalScore,
          rating: ratingText,
          speedScore,
          qualityScore,
          disciplineScore,
          accuracyRate: accuracyScore,
          delayMinutes,

          ordersPrepared: isFulfillment ? totalCompleted : 0,
          callsCount: !isFulfillment ? totalCompleted : 0,
          solvedTickets: !isFulfillment ? solvedComplaints : 0,
        },
      });

      
    }

    revalidatePath("/dashboard/evaluations");
    revalidatePath("/dashboard");
    return { success: true, message: "تم حساب وتحديث جميع التقييمات بنجاح!" };
  } catch (error) {
    console.error("Auto Evaluation Error:", error);
    return { error: "حدث خطأ أثناء حساب التقييمات التلقائية" };
  }
}
