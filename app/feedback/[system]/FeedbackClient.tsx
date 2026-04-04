"use client";

import { useState, useTransition } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import {
  Headset,
  ClipboardCheck,
  MessageSquareWarning,
  Shield,
  ArrowRight,
  Star,
  ChevronDown,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

export default function FeedbackClient({
  system,
  systemName,
}: {
  system: string;
  systemName: string;
}) {
  const [view, setView] = useState<
    "MENU" | "EVALUATION" | "COMPLAINT" | "SUCCESS"
  >("MENU");
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [fileName, setFileName] = useState<string>(""); // 👈 حالة لحفظ اسم الصورة المختارة

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("system", system);
    formData.append("type", view.toLowerCase());
    if (view === "EVALUATION") formData.append("rating", rating.toString());

    startTransition(async () => {
      const res = await submitFeedbackAction(formData);
      if (res.success) setView("SUCCESS");
      else alert(res.error);
    });
  };

  if (view === "SUCCESS") {
    return (
      <div
        className="min-h-[100dvh] bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-5"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-green-900 mb-2">شكراً لك!</h1>
          <p className="text-gray-600">
            تم إرسال رسالتك لإدارة {systemName} بنجاح.
          </p>
        </div>
      </div>
    );
  }

  if (view === "MENU") {
    return (
      <div
        className="min-h-[100dvh] bg-gradient-to-b from-green-50 to-white font-[Tajawal]"
        dir="rtl"
      >
        <div className="max-w-md mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 px-5 pt-12 pb-24 text-center sm:px-6 sm:pt-14 sm:pb-28">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5"></div>
            <div className="absolute top-8 -left-8 w-36 h-36 rounded-full bg-emerald-500/15"></div>
            <div className="relative inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-sm items-center justify-center mb-4 sm:mb-5 shadow-2xl shadow-green-900/40 border border-white/20">
              <Headset className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-white text-xl sm:text-2xl mb-2 tracking-tight">
              كيف يمكننا مساعدتك؟
            </h1>
            <p className="text-green-200/80 text-sm sm:text-base font-bold">
              نحن هنا دائماً لخدمة عملاء {systemName}
            </p>
          </div>

          <div className="px-4 sm:px-5 -mt-14 sm:-mt-16 pb-8 sm:pb-10 space-y-3 sm:space-y-4 relative">
            <button
              onClick={() => setView("EVALUATION")}
              className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-green-50 shadow-md active:scale-[0.98] transition-all text-right flex items-center gap-4 flex-row-reverse"
            >
              <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-600 shadow-lg">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-green-900 mb-1 font-bold">تقييم موظف</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  شاركنا تقييمك وساعدنا على تطوير مستوى الخدمة
                </p>
              </div>
            </button>

            <button
              onClick={() => setView("COMPLAINT")}
              className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-green-50 shadow-md active:scale-[0.98] transition-all text-right flex items-center gap-4 flex-row-reverse"
            >
              <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <MessageSquareWarning className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-red-900 mb-1 font-bold">شكوى على موظف</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  رفع شكوى بخصوص تجربة غير مرضية مع أحد موظفينا
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isComplaint = view === "COMPLAINT";

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-b from-green-50 to-white font-[Tajawal]"
      dir="rtl"
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto relative h-full min-h-[100dvh]"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-green-900 via-green-800 to-emerald-700 px-4 sm:px-5 pt-10 sm:pt-12 pb-6 sm:pb-7">
          <button
            type="button"
            onClick={() => setView("MENU")}
            className="relative flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-sm font-bold">رجوع</span>
          </button>
          <div className="relative">
            <h1 className="text-white text-lg sm:text-xl font-bold">
              {isComplaint ? "تفاصيل الشكوى" : "تقييمك يهمنا"}
            </h1>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-5 pb-32 space-y-5">
          <div className="w-full text-right">
            <label className="block mb-2.5 text-green-900 text-sm font-bold">
              اسم الموظف أو رقم الطلب
            </label>
            <input
              name="employeeName"
              type="text"
              placeholder="أدخل اسم الموظف أو رقم الطلب"
              className="w-full px-5 py-4 rounded-2xl bg-white border border-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <div className="w-full text-right">
            <label className="block mb-2.5 text-green-900 text-sm font-bold">
              نوع التواصل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="contactType"
                required
                className="w-full px-5 py-4 rounded-2xl bg-white border border-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm appearance-none text-gray-600"
              >
                <option value="">اختر نوع التواصل</option>
                <option value="whatsapp">واتساب</option>
                <option value="call">مكالمة</option>
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {isComplaint && (
            <div className="w-full text-right">
              <label className="block mb-2.5 text-green-900 text-sm font-bold">
                نوع الشكوى <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="complaintType"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm appearance-none text-gray-600"
                >
                  <option value="">اختر نوع الشكوى</option>
                  <option value="سوء التعامل">سوء التعامل</option>
                  <option value="تأخر في الرد">تأخر في الرد</option>
                  <option value="أخرى">أخرى</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {!isComplaint && (
            <div className="bg-white rounded-3xl p-6 shadow-md shadow-green-900/5 border border-green-50 text-center">
              <label className="block mb-4 text-green-900 text-sm font-bold">
                تقييمك للخدمة
              </label>
              <div className="flex gap-2 flex-row-reverse justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full text-right">
            <label className="block mb-2.5 text-green-900 text-sm font-bold">
              {isComplaint ? "تفاصيل الشكوى" : "ملاحظاتك (اختياري)"}
            </label>
            <textarea
              name="details"
              required={isComplaint}
              placeholder="شاركنا التفاصيل..."
              rows={4}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm resize-none"
            ></textarea>
          </div>

          {/* ==================================== */}
          {/* 📸 زر إرفاق الصورة المعدّل ليعمل بشكل صحيح */}
          {/* ==================================== */}
          {isComplaint && (
            <div className="w-full text-right">
              <label className="block mb-2.5 text-green-900 text-sm font-bold">
                إرفاق صورة المحادثة
              </label>
              <label className="cursor-pointer group w-full p-8 rounded-3xl border-2 border-dashed transition-all duration-300 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-500 flex flex-col items-center justify-center">
                {fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <p
                      className="text-green-800 text-sm font-bold truncate max-w-[200px]"
                      dir="ltr"
                    >
                      {fileName}
                    </p>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      تم الاختيار بنجاح
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-green-800 text-sm font-bold">
                      اضغط لرفع الصورة
                    </p>
                    <p className="text-xs text-green-600/70 mt-1">
                      PNG, JPG حتى 10MB
                    </p>
                  </>
                )}

                {/* الـ input المخفي الذي يقوم بالعمل الفعلي */}
                <input
                  type="file"
                  name="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-green-100 p-4 z-50">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-800 to-emerald-600 text-white font-bold shadow-lg disabled:opacity-50"
            >
              {isPending
                ? "جاري الإرسال..."
                : isComplaint
                  ? "إرسال الشكوى"
                  : "إرسال التقييم"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
