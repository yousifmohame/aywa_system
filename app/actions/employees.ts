'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

// ==============================
// 1. إضافة موظف جديد
// ==============================
export async function addEmployeeAction(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const departmentId = formData.get('departmentId') as string 
  const role = formData.get('role') as any
  const customStartTime = formData.get('customStartTime') as string
  const customEndTime = formData.get('customEndTime') as string

  // التحقق من الحقول الأساسية
  if (!fullName || !email || !password || !departmentId) {
    return { error: 'يرجى ملء جميع الحقول المطلوبة' }
  }

  // تنظيف الإيميل
  const cleanEmail = email.trim().toLowerCase()

  try {
    // التحقق من وجود الإيميل مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return { error: 'البريد الإلكتروني هذا مسجل بالفعل' }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء الموظف
    await prisma.user.create({
      data: {
        fullName,
        email: cleanEmail,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        departmentId: departmentId, 
        customStartTime: customStartTime || null,
        customEndTime: customEndTime || null,
        isActive: true,
        // صورة افتراضية
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      },
    })

    revalidatePath('/dashboard/employees')
    return { success: true }

  } catch (error) {
    console.error('Add Employee Error:', error)
    return { error: 'حدث خطأ أثناء إضافة الموظف' }
  }
}

// ==============================
// 2. تعديل بيانات الموظف
// ==============================
export async function editEmployeeAction(formData: FormData) {
  const id = formData.get('id') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const departmentId = formData.get('departmentId') as string
  const role = formData.get('role') as any
  const isActive = formData.get('isActive') === 'on' 
  const customStartTime = formData.get('customStartTime') as string
  const customEndTime = formData.get('customEndTime') as string

  if (!id || !fullName || !email || !departmentId) {
    return { error: 'البيانات الأساسية مطلوبة' }
  }

  const cleanEmail = email.trim().toLowerCase()

  try {
    // التحقق من أن الإيميل الجديد غير مستخدم من قبل شخص آخر
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: cleanEmail,
        id: { not: id } // استثناء الموظف الحالي
      }
    })

    if (existingUser) {
      return { error: 'البريد الإلكتروني هذا مستخدم بالفعل لموظف آخر' }
    }

    // تجهيز البيانات للتحديث
    const updateData: any = {
      fullName,
      email: cleanEmail,
      departmentId,
      role,
      isActive,
      customStartTime: customStartTime || null,
      customEndTime: customEndTime || null,
    }

    // تحديث كلمة المرور (فقط إذا كتب واحدة جديدة) وتشفيرها
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/dashboard/employees')
    return { success: true }

  } catch (error) {
    console.error('Edit Employee Error:', error)
    return { error: 'فشل تحديث البيانات. يرجى مراجعة المدخلات.' }
  }
}

// ==============================
// 3. حذف موظف
// ==============================
export async function deleteEmployeeAction(employeeId: string) {
  if (!employeeId) return { error: 'رقم الموظف غير صحيح' }

  try {
    // تنظيف البيانات المرتبطة يدوياً للأمان
    await prisma.dailyPerformance.deleteMany({ where: { userId: employeeId } })
    await prisma.task.deleteMany({ where: { assignedToId: employeeId } })

    // حذف الموظف
    await prisma.user.delete({
      where: { id: employeeId }
    })

    revalidatePath('/dashboard/employees')
    return { success: true }
  } catch (error) {
    console.error('Delete Error:', error)
    return { error: 'فشل حذف الموظف، قد توجد سجلات مرتبطة.' }
  }
}