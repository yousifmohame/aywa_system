'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// تحديد الإيميلات حسب الجهة
const systemEmails: Record<string, string> = {
  'aywa-nazeel': 'info@aywanazeel.com',
  'sabl': 'refunds@sabl.com', // يمكنك تغييره لاحقاً
}

const systemNames: Record<string, string> = {
  'aywa-nazeel': 'إيوا نزيل',
  'sabl': 'شركة الشحن سبل (استرداد)',
}

export async function submitRefundAction(formData: FormData) {
  try {
    const system = formData.get('system') as string
    const targetEmail = systemEmails[system]
    const systemName = systemNames[system]

    if (!targetEmail) return { error: 'نظام غير معروف' }

    // استخراج البيانات
    const employeeName = formData.get('employeeName') as string
    const issueType = formData.get('issueType') as string
    const inmateName = formData.get('inmateName') as string
    const inmateId = formData.get('inmateId') as string
    const prisonName = formData.get('prisonName') as string
    const iban = formData.get('iban') as string
    const last4Digits = formData.get('last4Digits') as string
    const accountName = formData.get('accountName') as string
    
    // معالجة المرفق (البلاغ)
    const file = formData.get('file') as File | null
    let attachments = []

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      attachments.push({ filename: file.name, content: buffer })
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial; padding: 20px; color: #333; background-color: #f3f4f6;">
        <div style="max-w: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h2 style="color: #fff; margin: 0;">نموذج استرداد مالي جديد 💳</h2>
            <p style="color: #dbeafe; margin: 5px 0 0 0;">الجهة: ${systemName}</p>
          </div>
          
          <div style="padding: 20px;">
            <p><strong>الموظف مقدم الطلب:</strong> ${employeeName}</p>
            <p><strong>نوع المشكلة:</strong> <span style="color: #dc2626; font-weight: bold;">${issueType}</span></p>
            
            <h3 style="border-bottom: 2px solid #f3f4f6; padding-bottom: 5px; color: #1e40af;">👤 بيانات النزيل</h3>
            <p><strong>الاسم الرباعي:</strong> ${inmateName}</p>
            <p><strong>رقم الهوية:</strong> ${inmateId}</p>
            <p><strong>اسم السجن:</strong> ${prisonName}</p>
            
            <h3 style="border-bottom: 2px solid #f3f4f6; padding-bottom: 5px; color: #1e40af;">🏦 البيانات البنكية</h3>
            <p><strong>اسم صاحب الحساب:</strong> ${accountName}</p>
            <p><strong>الآيبان (IBAN):</strong> <span dir="ltr">${iban}</span></p>
            <p><strong>آخر 4 أرقام:</strong> <span dir="ltr">${last4Digits}</span></p>
          </div>
        </div>
      </div>
    `

    await resend.emails.send({
      from: 'Refund System <onboarding@resend.dev>',
      to: targetEmail,
      subject: `طلب استرداد جديد - ${inmateName} - ${systemName}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    return { success: true }
  } catch (error) {
    console.error('Refund Error:', error)
    return { error: 'حدث خطأ أثناء الإرسال' }
  }
}