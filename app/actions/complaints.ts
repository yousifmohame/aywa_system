// app/actions/complaints.ts
"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";

// تهيئة إعدادات Cloudinary (تأكد من وجودها في ملف .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const statusInArabic: Record<string, string> = {
  PENDING: "قيد الانتظار",
  IN_PROGRESS: "قيد المعالجة",
  SOLVED: "تم الحل",
  CLOSED: "مغلق",
};

// 1. دالة إنشاء الشكوى ورفع الملفات
export async function submitComplaintAction(formData: FormData) {
  const submissionType = formData.get("submissionType") as string;
  const serviceType = formData.get("serviceType") as string;
  const orderNumber = formData.get("orderNumber") as string;
  const clientType = formData.get("clientType") as string;
  const clientName = formData.get("clientName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const content = formData.get("content") as string;
  const sourceSystem = formData.get("sourceSystem") as string;

  const files = formData.getAll("files") as File[];

  if (
    !submissionType ||
    !serviceType ||
    !clientType ||
    !clientName ||
    !phone ||
    !email ||
    !sourceSystem
  ) {
    return { error: "يرجى تعبئة جميع الحقول المطلوبة (*)" };
  }

  try {
    const uploadedFilesData: {
      fileUrl: string;
      fileName: string;
      fileType: string;
    }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadResult = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result?.secure_url as string);
                },
              )
              .end(buffer);
          });

          uploadedFilesData.push({
            fileUrl: uploadResult,
            fileName: file.name,
            fileType: file.type || "unknown",
          });
        }
      }
    }

    await prisma.complaint.create({
      data: {
        submissionType,
        serviceType,
        orderNumber: orderNumber || null,
        clientType,
        clientName,
        phone,
        email,
        content: content || "",
        status: "PENDING",
        sourceSystem,

        attachments: {
          create: uploadedFilesData.map((fileData) => ({
            fileUrl: fileData.fileUrl,
            fileName: fileData.fileName,
            fileType: fileData.fileType,
          })),
        },
      },
    });

    revalidatePath('/dashboard/complaints');
    revalidatePath('/dashboard/my-complaints');

    return { success: true };
  } catch (error) {
    console.error("CRITICAL ERROR SUBMITTING COMPLAINT:", error);
    return { error: "حدث خطأ فني أثناء المعالجة، يرجى المحاولة لاحقاً" };
  }
}

// 2. تحديث حالة الشكوى وإرسال إيميل للعميل (للموظف/المدير)
export async function updateComplaintStatusAction(
  id: string,
  status: string,
  note?: string,
) {
  try {
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      return { error: "الشكوى غير موجودة" };
    }

    await prisma.complaint.update({
      where: { id },
      data: {
        status,
        adminNote: note,
      },
    });

    if (existingComplaint.email) {
      const systemName =
        existingComplaint.sourceSystem === "aywa_nazeel"
          ? "إيوا نزيل"
          : existingComplaint.sourceSystem === "nazeel_store"
            ? "نزيل ستور"
            : existingComplaint.sourceSystem === "prison_nazeel"
              ? "نزيل السجن"
              : existingComplaint.sourceSystem === "liniora"
                ? "لينيورا"
                : "خدمة العملاء";

      let statusTitle = "";
      let defaultMessage = "";
      let themeColor = "";
      let themeBg = "";

      switch (status) {
        case "IN_PROGRESS":
          statusTitle = "جاري العمل على طلبك ⏳";
          defaultMessage =
            "فريقنا يقوم الآن بمراجعة ومعالجة البلاغ الخاص بك. نحن نبذل قصارى جهدنا لحل المشكلة في أسرع وقت ممكن.";
          themeColor = "#d97706";
          themeBg = "#fffbeb";
          break;
        case "SOLVED":
          statusTitle = "تم حل مشكلتك بنجاح ✅";
          defaultMessage =
            "يسعدنا إبلاغك بأنه تم إيجاد حل لطلبك والانتهاء منه بنجاح. نأمل أن نكون دائماً عند حسن ظنك.";
          themeColor = "#16a34a";
          themeBg = "#f0fdf4";
          break;
        case "CLOSED":
          statusTitle = "تم إغلاق التذكرة 🔒";
          defaultMessage =
            "تم إغلاق هذا البلاغ في نظامنا. إذا كان لديك أي استفسارات أو واجهتك المشكلة مجدداً، لا تتردد في فتح طلب جديد.";
          themeColor = "#4b5563";
          themeBg = "#f3f4f6";
          break;
        case "PENDING":
        default:
          statusTitle = "طلبك قيد الانتظار ⏱️";
          defaultMessage =
            "تم استلام طلبك وهو الآن في قائمة الانتظار. سيتم تعيينه لأحد ممثلي خدمة العملاء للبدء في حله قريباً.";
          themeColor = "#2563eb";
          themeBg = "#eff6ff";
          break;
      }

      const finalMessage =
        note && note.trim() !== ""
          ? note.replace(/\n/g, "<br/>")
          : defaultMessage;

      const emailHtml = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: right;">
          <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div style="background-color: ${themeColor}; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${systemName}</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">مرحباً ${existingComplaint.clientName}،</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                نود إعلامك بوجود تحديث جديد بخصوص البلاغ رقم: 
                <strong dir="ltr" style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #1f2937;">
                  #${existingComplaint.orderNumber || existingComplaint.id.substring(0, 6)}
                </strong>
              </p>
              <div style="background-color: ${themeBg}; border-right: 4px solid ${themeColor}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: ${themeColor}; font-size: 18px;">${statusTitle}</h3>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.8;">
                  ${finalMessage}
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                شكراً لثقتكم وتواصلكم معنا.<br/>
                مع خالص التحيات،<br/>
                <strong style="color: #1f2937;">فريق دعم ${systemName}</strong>
              </p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px;">
              هذه رسالة تلقائية من النظام، يرجى عدم الرد عليها مباشرة.
            </p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: "Support <aywa@aywasystem.online>",
        to: existingComplaint.email,
        subject: `${statusTitle} - ${systemName}`,
        html: emailHtml,
      });
    }

    revalidatePath("/dashboard/complaints");
    return { success: true };
  } catch (error) {
    console.error("Error updating status or sending email:", error);
    return { error: "فشل تحديث الحالة أو إرسال البريد" };
  }
}

// 3. إسناد الشكوى لموظف (مع إرسال إيميل)
export async function assignComplaintAction(complaintId: string, employeeId: string) {
  try {
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        assignedToId: employeeId,
        status: 'PENDING' 
      },
      include: {
        assignedTo: true 
      }
    });

    if (updatedComplaint.assignedTo?.email) {
      const systemName = updatedComplaint.sourceSystem === 'aywa_nazeel' ? 'إيوا نزيل' : 
                         updatedComplaint.sourceSystem === 'nazeel_store' ? 'نزيل ستور' :
                         updatedComplaint.sourceSystem === 'prison_nazeel' ? 'نزيل السجن' : 
                         updatedComplaint.sourceSystem === 'liniora' ? 'لينيورا' : 'النظام';

      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-w-lg; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">مرحباً ${updatedComplaint.assignedTo.fullName}،</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            لقد تم إسناد <b>شكوى جديدة</b> إليك من نظام <b>${systemName}</b>.
          </p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #3b82f6;">
            <p style="margin: 0 0 10px 0;"><b>رقم البلاغ:</b> <span dir="ltr">#${updatedComplaint.orderNumber || updatedComplaint.id.substring(0,6)}</span></p>
            <p style="margin: 0 0 10px 0;"><b>نوع الخدمة:</b> ${updatedComplaint.serviceType}</p>
            <p style="margin: 0;"><b>وقت الاستلام:</b> ${new Date().toLocaleString('ar-EG')}</p>
          </div>
          <p style="font-size: 14px; color: #ef4444; font-weight: bold;">
            ⏱️ يرجى سرعة معالجة الشكوى، حيث سيتم حساب "سرعة الإنجاز" من وقت استلامك لها لتقييم أدائك.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            بالتوفيق،<br/>
            <b>الإدارة</b>
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'Aywa System <aywa@aywasystem.online>',
        to: updatedComplaint.assignedTo.email,
        subject: `تنبيه: شكوى جديدة مسندة إليك 🔔`,
        html: emailHtml,
      });
    }

    revalidatePath('/dashboard/complaints');
    revalidatePath('/dashboard/my-complaints');
    return { success: true };
  } catch (error) {
    console.error("Error assigning complaint:", error);
    return { error: 'فشل إسناد الشكوى' };
  }
}

// 4. جلب الشكاوى المسندة لموظف معين مع دعم تقسيم الصفحات (Pagination)
export async function getEmployeeComplaintsAction(employeeId: string, page: number = 1, limit: number = 50) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { allowedSystems: true }
    });

    const allowedSystemsArray = user?.allowedSystems ? user.allowedSystems.split(',') : [];
    const skip = (page - 1) * limit;

    // استخراج الشروط في متغير لفصلها وتمريرها لكل من دالة الجلب والعد
    const whereClause = {
      OR: [
        { assignedToId: employeeId },
        { sourceSystem: { in: allowedSystemsArray } }
      ]
    };

    // استخدام Transaction لجلب الشكاوى والعدد الكلي بشكل متزامن وبأعلى سرعة
    const [complaints, totalCount] = await prisma.$transaction([
      prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
      }),
      prisma.complaint.count({
        where: whereClause,
      }),
    ]);

    return { 
      success: true, 
      data: complaints,
      metadata: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      }
    };
  } catch (error) {
    console.error("Error fetching employee complaints:", error);
    return { error: 'فشل جلب الشكاوى' };
  }
}

// 5. جلب بيانات شكوى محددة بالـ ID
export async function getComplaintByIdAction(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        attachments: true, 
      },
    });

    if (!complaint) return { error: "الشكوى غير موجودة" };

    return { success: true, data: complaint };
  } catch (error) {
    return { error: "حدث خطأ في جلب البيانات" };
  }
}

// 6. جلب كل الشكاوى للمدير مع دعم تقسيم الصفحات (Pagination)
export async function getAllComplaintsAction(page: number = 1, limit: number = 50) {
  try {
    const skip = (page - 1) * limit;

    const [complaints, totalCount] = await prisma.$transaction([
      prisma.complaint.findMany({
        include: { assignedTo: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.complaint.count(),
    ]);

    return { 
      success: true, 
      data: complaints,
      metadata: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      }
    };
  } catch (error) {
    return { error: "فشل جلب البيانات" };
  }
}
