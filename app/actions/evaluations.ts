'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveEvaluationAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const dateStr = formData.get('date') as string
  
  // القيم التشغيلية (الحقائق)
  const volume = parseInt(formData.get('volume') as string) || 0     // عدد الطلبات أو المكالمات
  const timeMetric = parseInt(formData.get('timeMetric') as string) || 0 // متوسط الوقت

  // القيم التقديرية (ما زالت يدوية حالياً)
  const accuracyScore = parseInt(formData.get('accuracy') as string) || 0
  const qualityScore = parseInt(formData.get('quality') as string) || 0
  const disciplineScore = parseInt(formData.get('discipline') as string) || 0

  const date = new Date(dateStr)

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: { include: { evaluationSettings: true } } }
    })

    if (!user || !user.department?.evaluationSettings) {
      return { error: 'لا توجد إعدادات تقييم لهذا القسم، يرجى ضبطها أولاً' }
    }

    const settings = user.department.evaluationSettings
    const deptName = user.department.name
    const isFulfillment = deptName.includes('تجهيز') || deptName.includes('تنفيذ')
    
    // ==========================================
    // 🚀 التحديث الجديد: حساب السرعة تلقائياً
    // ==========================================
    const dailyTarget = settings.dailyTarget || 50 // القيمة الافتراضية إذا لم تحدد
    
    // معادلة حساب السرعة: (المنجز / المستهدف) * 100
    // نستخدم Math.min(100, ...) لكي لا تتجاوز النتيجة 100% حتى لو أنجز أكثر (يمكنك إزالتها إذا أردت بونص)
    let calculatedSpeedScore = 0
    if (dailyTarget > 0) {
      calculatedSpeedScore = Math.round((volume / dailyTarget) * 100)
    }
    
    // تحديد سقف للسرعة بـ 100 (اختياري)
    const finalSpeedScore = Math.min(100, calculatedSpeedScore)

    // ==========================================
    // حساب النتيجة النهائية الموزونة
    // ==========================================
    const finalScore = Math.round(
      (finalSpeedScore * settings.speedWeight / 100) +
      (accuracyScore * settings.accuracyWeight / 100) +
      (qualityScore * settings.qualityWeight / 100) +
      (disciplineScore * settings.disciplineWeight / 100)
    )

    // تحديد التقييم اللفظي
    let ratingText = 'ضعيف'
    if (finalScore >= 90) ratingText = 'ممتاز'
    else if (finalScore >= 80) ratingText = 'جيد جداً'
    else if (finalScore >= 70) ratingText = 'جيد'
    else if (finalScore >= 50) ratingText = 'مقبول'

    // تجهيز البيانات للحفظ
    const performanceData = {
      score: finalScore,
      rating: ratingText,
      
      // حفظ الدرجات التفصيلية
      speedScore: finalSpeedScore, // القيمة المحسوبة آلياً
      qualityScore: qualityScore,
      disciplineScore: disciplineScore,
      accuracyRate: accuracyScore,

      // حفظ البيانات التشغيلية للإحصائيات
      ordersPrepared: isFulfillment ? volume : 0,
      avgPrepTime: isFulfillment ? timeMetric : 0,
      callsCount: !isFulfillment ? volume : 0,
      avgResponseTime: !isFulfillment ? timeMetric : 0,
    }

    await prisma.dailyPerformance.upsert({
      where: {
        userId_date: { userId, date }
      },
      update: performanceData,
      create: {
        user: { connect: { id: userId } },
        date: date,
        ...performanceData
      }
    })

    revalidatePath('/dashboard/evaluations')
    return { success: true }
  } catch (error) {
    console.error('Save Error:', error)
    return { error: 'فشل الحفظ' }
  }
}