// app/actions/complaints.ts
'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function submitComplaintAction(formData: FormData) {
  const submissionType = formData.get('submissionType') as string
  const serviceType = formData.get('serviceType') as string
  const orderNumber = formData.get('orderNumber') as string
  const clientType = formData.get('clientType') as string
  const clientName = formData.get('clientName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const content = formData.get('content') as string
  
  // 1. استقبال الملفات
  const files = formData.getAll('files') as File[]

  if (!submissionType || !serviceType || !clientType || !clientName || !phone || !email) {
    return { error: 'يرجى تعبئة جميع الحقول المطلوبة (*)' }
  }

  try {
    // 2. إنشاء الشكوى أولاً
    const newComplaint = await prisma.complaint.create({
      data: {
        submissionType,
        serviceType,
        orderNumber: orderNumber || null,
        clientType,
        clientName,
        phone,
        email,
        content: content || '',
        status: 'PENDING'
      }
    })

    // 3. معالجة الملفات وحفظها (إذا وجدت)
    if (files && files.length > 0) {
      // التأكد من وجود المجلد
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (e) {
        // المجلد موجود بالفعل
      }

      for (const file of files) {
        // تجاهل الملفات الفارغة (يحدث أحياناً إذا لم يختر المستخدم شيئاً)
        if (file.size === 0) continue;

        // إنشاء اسم فريد للملف
        const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
        const filePath = path.join(uploadDir, uniqueName)
        
        // تحويل الملف وحفظه
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // حفظ الرابط في قاعدة البيانات
        await prisma.attachment.create({
          data: {
            filePath: `/uploads/${uniqueName}`, // المسار الذي سيستخدم في العرض
            fileName: file.name,
            fileType: file.type,
            complaintId: newComplaint.id
          }
        })
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error submitting complaint:', error)
    return { error: 'حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى' }
  }
}

// 2. تحديث حالة الشكوى (للموظف/المدير - Protected)
export async function updateComplaintStatusAction(id: string, status: string, note?: string) {
  try {
    await prisma.complaint.update({
      where: { id },
      data: { 
        status,
        adminNote: note 
      }
    })
    revalidatePath('/dashboard/complaints')
    return { success: true }
  } catch (error) {
    return { error: 'فشل تحديث الحالة' }
  }
}

export async function assignComplaintAction(complaintId: string, employeeId: string) {
  try {
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        assignedToId: employeeId,
        status: 'PENDING' // يمكن تغييرها إلى "قيد المعالجة" إذا أردت
      }
    })
    revalidatePath('/dashboard/complaints')
    revalidatePath('/dashboard/my-complaints')
    return { success: true }
  } catch (error) {
    return { error: 'فشل إسناد الشكوى' }
  }
}

// 2. جلب الشكاوى المسندة لموظف معين (لصفحة الموظف)
export async function getEmployeeComplaintsAction(employeeId: string) {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { assignedToId: employeeId },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: complaints }
  } catch (error) {
    return { error: 'فشل جلب الشكاوى' }
  }
}

export async function getComplaintByIdAction(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { 
        assignedTo: true ,
        attachments: true
      }
    })
    
    if (!complaint) return { error: 'الشكوى غير موجودة' }
    
    return { success: true, data: complaint }
  } catch (error) {
    return { error: 'حدث خطأ في جلب البيانات' }
  }
}

// 3. جلب كل الشكاوى مع بيانات الموظف المسند إليه (للمدير)
// (تحديث للدالة القديمة getComplaintsAction)
export async function getAllComplaintsAction() {
    try {
        const complaints = await prisma.complaint.findMany({
            include: { assignedTo: { select: { fullName: true } } }, // جلب اسم الموظف
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: complaints }
    } catch (error) {
        return { error: 'فشل جلب البيانات' }
    }
}