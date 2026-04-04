"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const systemEmails: Record<string, string> = {
  "aywa-nazeel": "info@aywanazeel.com",
  "nazeel-store": "info@nazeelstore.com",
};

const systemNames: Record<string, string> = {
  "aywa-nazeel": "إيوا نزيل",
  "nazeel-store": "نزيل ستور",
};

export async function submitFeedbackAction(formData: FormData) {
  try {
    const system = formData.get("system") as string;
    const type = formData.get("type") as string;

    const targetEmail = systemEmails[system];
    const systemName = systemNames[system];

    if (!targetEmail) return { error: "نظام غير معروف" };

    const employeeName = formData.get("employeeName") as string;
    const contactType = formData.get("contactType") as string;
    const details = formData.get("details") as string;
    const rating = formData.get("rating") as string;
    const complaintType = formData.get("complaintType") as string;

    // =====================================
    // 📸 معالجة الصورة المرفقة وإضافتها
    // =====================================
    const file = formData.get("file") as File | null;
    let attachments = [];

    if (file && file.size > 0) {
      // تحويل الملف إلى Buffer لكي يقبله البريد الإلكتروني
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    const isComplaint = type === "complaint";
    const subject = isComplaint
      ? `🚨 شكوى جديدة - ${systemName}`
      : `⭐ تقييم جديد - ${systemName}`;

    // إعداد ألوان القالب بناءً على نوع الرسالة
    const themeColor = isComplaint ? '#dc2626' : '#10b981'; // أحمر للشكوى، أخضر للتقييم
    const themeBg = isComplaint ? '#fef2f2' : '#ecfdf5';
    const labelTitle = isComplaint ? 'إشعار بشكوى جديدة 🚨' : 'إشعار بتقييم جديد ⭐';

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; text-align: right;">
        
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: ${themeColor}; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;">
              ${systemName}
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">
              ${labelTitle}
            </p>
          </div>

          <div style="padding: 30px;">
            <p style="color: #4b5563; font-size: 16px; margin-top: 0; margin-bottom: 25px; line-height: 1.6;">
              مرحباً فريق الإدارة،<br>
              تم استلام رسالة جديدة من خلال نظام آراء العملاء. إليكم التفاصيل أدناه:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; width: 40%; color: #6b7280; font-size: 14px;">👤 اسم الموظف / الطلب:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: bold;">${employeeName || "لم يُحدد"}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">📞 طريقة التواصل:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: bold;">${contactType === "whatsapp" ? "واتساب" : "مكالمة"}</td>
              </tr>
              ${isComplaint ? `
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">⚠️ نوع الشكوى:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #dc2626; font-size: 14px; font-weight: bold;">${complaintType}</td>
              </tr>
              ` : `
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">⭐ التقييم:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #10b981; font-size: 16px; font-weight: bold;">${rating} / 5</td>
              </tr>
              `}
            </table>

            <h3 style="color: #374151; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              📝 التفاصيل والملاحظات:
            </h3>
            <div style="background-color: ${themeBg}; border-right: 4px solid ${themeColor}; padding: 20px; border-radius: 8px; color: #1f2937; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${details || "لا توجد تفاصيل إضافية مكتوبة من قبل العميل."}</div>

          </div>

          <div style="background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
              هذا إشعار تلقائي من نظام <strong>${systemName}</strong> لخدمة العملاء.<br>
              يرجى المراجعة واتخاذ الإجراء اللازم.
            </p>
          </div>

        </div>
      </div>
    `;

    // إرسال الإيميل مع المرفقات
    await resend.emails.send({
      from: "System Feedback <aywa@aywasystem.online>", // لا تنس تغييره لاحقاً لإيميلك الرسمي
      to: targetEmail,
      subject: subject,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined, // 👈 إرفاق الصورة هنا
    });

    return { success: true };
  } catch (error) {
    console.error("Feedback Error:", error);
    return { error: "حدث خطأ أثناء الإرسال" };
  }
}
