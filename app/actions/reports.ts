'use server'

import { prisma } from '@/app/lib/prisma'

export async function getTopEmployeesAction() {
  try {
    // 1. تحديد نطاق التاريخ (الشهر الحالي)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // 2. تجميع البيانات وحساب المتوسطات
    const aggregations = await prisma.dailyPerformance.groupBy({
      by: ['userId'],
      where: {
        date: {
          gte: firstDay,
          lte: lastDay
        }
      },
      _avg: {
        score: true, // متوسط التقييم العام
      },
      _sum: {
        ordersPrepared: true, // مجموع الإنتاجية (تجهيز)
        callsCount: true      // مجموع الإنتاجية (مكالمات)
      },
      orderBy: {
        _avg: {
          score: 'desc' // الترتيب من الأعلى للأقل
        }
      },
      take: 5 // نكتفي بأفضل 5
    })

    // 3. جلب تفاصيل الموظفين (لأن groupBy لا يعيد العلاقات)
    const userIds = aggregations.map(a => a.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { 
        id: true, 
        fullName: true, 
        avatarUrl: true, 
        department: { select: { name: true } } 
      }
    })

    // 4. دمج البيانات وتنسيقها للعرض
    const leaderboard = aggregations.map((agg, index) => {
      const user = users.find(u => u.id === agg.userId)
      const production = (agg._sum.ordersPrepared || 0) + (agg._sum.callsCount || 0)
      
      return {
        rank: index + 1,
        id: agg.userId,
        name: user?.fullName || 'مستخدم غير معروف',
        avatar: user?.avatarUrl || '',
        department: user?.department?.name || '',
        score: Math.round(agg._avg.score || 0), // تقريب النتيجة
        production: production, // إجمالي ما أنجزه في الشهر
      }
    })

    return { success: true, data: leaderboard }

  } catch (error) {
    console.error('Leaderboard Error:', error)
    return { error: 'فشل جلب قائمة المتصدرين' }
  }
}