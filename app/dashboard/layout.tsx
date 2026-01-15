import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '../lib/prisma'
import DashboardLayoutClient from '@/app/components/DashboardLayoutClient' // استدعاء المكون الجديد

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  // 1. حماية المسار
  if (!userId) {
    redirect('/')
  }

  // 2. جلب بيانات المستخدم (الدور + الاسم الكامل للهيدر)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, fullName: true }
  })

  if (!user) redirect('/')

  // 3. تمرير البيانات للمكون التفاعلي
  return (
    <DashboardLayoutClient 
      userRole={user.role} 
      fullName={user.fullName}
    >
      {children}
    </DashboardLayoutClient>
  )
}