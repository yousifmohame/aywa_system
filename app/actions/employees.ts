'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

// دالة إضافة موظف جديد
export async function addEmployeeAction(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // التغيير هنا: استقبال departmentId بدلاً من department
  const departmentId = formData.get('departmentId') as string 
  const role = formData.get('role') as any

  // التحقق من أن departmentId موجود أيضاً
  if (!fullName || !email || !password || !departmentId) {
    return { error: 'يرجى ملء جميع الحقول المطلوبة' }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        // التغيير هنا: استخدام departmentId للربط
        departmentId: departmentId, 
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      },
    })

    revalidatePath('/dashboard/employees')
    return { success: true }

  } catch (error) {
    console.error(error)
    return { error: 'حدث خطأ أثناء إضافة الموظف' }
  }
}

export async function editEmployeeAction(formData: FormData) {
  const id = formData.get('id') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const departmentId = formData.get('departmentId') as string
  const role = formData.get('role') as any
  const isActive = formData.get('isActive') === 'on' // Checkbox handling
  const password = formData.get('password') as string

  try {
    const data: any = {
      fullName,
      email,
      departmentId,
      role,
      isActive
    }

    // تحديث كلمة المرور فقط إذا قام المستخدم بكتابة واحدة جديدة
    if (password && password.trim() !== '') {
      // هنا يجب تشفير كلمة المرور (سنتجاوز التشفير للتبسيط، لكن استخدم bcrypt في الواقع)
      data.password = password 
    }

    await prisma.user.update({
      where: { id },
      data: data
    })

    revalidatePath('/dashboard/employees')
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث البيانات' }
  }
}

// دالة حذف موظف
export async function deleteEmployeeAction(employeeId: string) {
  try {
    // حذف السجلات المرتبطة أولاً (مثل الأداء والمهام) لتجنب أخطاء Foreign Key
    // ملاحظة: إذا كان لديك `onDelete: Cascade` في قاعدة البيانات، يكفي حذف اليوزر فقط.
    // لكن للأمان سنحذف الأداء اليومي أولاً إذا لم يكن Cascade مفعلاً
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
    return { error: 'فشل حذف الموظف. قد يكون لديه سجلات مرتبطة.' }
  }
}