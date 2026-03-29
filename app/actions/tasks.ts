'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY);
// 1. إنشاء مهمة جديدة
export async function createTaskAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const assignedToId = formData.get('assignedToId') as string;
    const dueDateString = formData.get('dueDate') as string;

    if (!title || !assignedToId) {
      return { error: 'العنوان والموظف مطلوبان' };
    }

    // تجهيز التاريخ إذا تم إدخاله
    const dueDate = dueDateString ? new Date(dueDateString) : null;

    // 1. إنشاء المهمة في قاعدة البيانات
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId,
        dueDate,
        status: 'PENDING'
      },
      include: {
        assignedTo: true // لجلب إيميل الموظف
      }
    });

    // 2. إرسال الإيميل للموظف
    if (newTask.assignedTo?.email) {
      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-w-lg; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #8b5cf6;">مرحباً ${newTask.assignedTo.fullName}،</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            تم تكليفك بـ <b>مهمة إدارية جديدة</b>.
          </p>
          
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #8b5cf6;">
            <p style="margin: 0 0 10px 0;"><b>عنوان المهمة:</b> ${title}</p>
            ${dueDate ? `<p style="margin: 0 0 10px 0; color: #ef4444;"><b>📅 موعد التسليم (الـ Deadline):</b> ${dueDate.toLocaleDateString('ar-EG')}</p>` : ''}
            <p style="margin: 0;"><b>التفاصيل:</b> <br/><span style="color: #4b5563;">${description || 'لا توجد تفاصيل إضافية.'}</span></p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            بالتوفيق في إنجازها،<br/>
            <b>الإدارة</b>
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'Aywa System Tasks <aywa@aywasystem.online>', // غيره لاحقاً
        to: newTask.assignedTo.email,
        subject: `مهمة جديدة: ${title} 📋`,
        html: emailHtml,
      });
    }

    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error creating task:', error);
    return { error: 'حدث خطأ أثناء إنشاء المهمة' };
  }
}

// 2. تحديث حالة المهمة (للموظف)
export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    })
    
    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard/employee') // لتحديث عداد المهام في لوحة الموظف
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث الحالة' }
  }
}

// 3. حذف المهمة
export async function deleteTaskAction(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId }
    })
    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (error) {
    return { error: 'فشل حذف المهمة' }
  }
}