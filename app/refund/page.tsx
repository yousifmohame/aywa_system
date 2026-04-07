"use client";

import { useState, useTransition } from "react";
import { submitUnifiedRefundAction } from "@/app/actions/refund";
import {
  RefreshCcw,
  UserCircle,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function UnifiedRefundPage() {
  const [department, setDepartment] = useState<"aywa" | "sabl">("aywa");
  // 👈 إضافة حالة جديدة لمراقبة نوع التواصل
  const [contactType, setContactType] = useState<"whatsapp" | "call" | "">("");

  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await submitUnifiedRefundAction(formData);
        if (res.success) {
          setIsSuccess(true);
        } else {
          setErrorMessage(res.error || "حدث خطأ غير متوقع.");
        }
      } catch (error) {
        setErrorMessage("تعذر الاتصال بالخادم. يرجى المحاولة مجدداً.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-green-50 p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            تم إرسال الطلب بنجاح!
          </h2>
          <p className="text-gray-500">
            تم تحويل طلبك للإدارة المعنية بنجاح وسيتم مراجعته قريباً.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 font-[Tajawal]"
      dir="rtl"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-50 p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-800 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-900/20 border border-green-700">
              <RefreshCcw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-green-900 mb-2">
              نموذج الاسترجاع
            </h1>
            <p className="text-sm text-gray-500">
              قم بملء البيانات المطلوبة أدناه
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="sourceName" value="aywa" />

            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
              <label className="flex items-center gap-2 mb-3 text-sm font-bold text-green-900">
                <UserCircle className="w-5 h-5 text-green-700" />
                <span>اسم الموظف المتخذ الإجراء</span>
              </label>
              <input
                name="employeeName"
                type="text"
                className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                placeholder="أدخل اسم الموظف"
                required
              />
            </div>

            <div>
              <label className="block mb-3 text-sm font-bold text-green-900">
                جهة الاسترجاع
              </label>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${department === "aywa" ? "border-green-600 bg-green-50 shadow-sm text-green-800 font-bold" : "border-gray-200 hover:border-green-300 hover:bg-green-50/30 text-gray-600"}`}
                >
                  <input
                    type="radio"
                    name="department"
                    value="aywa"
                    checked={department === "aywa"}
                    onChange={() => setDepartment("aywa")}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span>أيوا نزيل</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${department === "sabl" ? "border-green-600 bg-green-50 shadow-sm text-green-800 font-bold" : "border-gray-200 hover:border-green-300 hover:bg-green-50/30 text-gray-600"}`}
                >
                  <input
                    type="radio"
                    name="department"
                    value="sabl"
                    checked={department === "sabl"}
                    onChange={() => setDepartment("sabl")}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span>شركة الشحن سبل</span>
                </label>
              </div>
            </div>

            {/* 🟦 حقول "أيوا نزيل" */}
            {department === "aywa" && (
              <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                <div>
                  <label className="block mb-2 text-sm font-bold text-green-900">
                    نوع الإجراء
                  </label>
                  <select
                    name="actionType"
                    className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm text-gray-600"
                    required
                  >
                    <option value="">اختر نوع الإجراء</option>
                    <option value="إلغاء">إلغاء</option>
                    <option value="جزئي">جزئي</option>
                    <option value="كامل">كامل</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-green-900">
                    رقم الطلب
                  </label>
                  <input
                    name="orderNumber"
                    type="text"
                    className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                    placeholder="أدخل رقم الطلب"
                    required
                  />
                </div>

                {/* 👈 أزرار اختيار نوع التواصل الذكية */}
                <div>
                  <label className="block mb-3 text-sm font-bold text-green-900">
                    نوع التواصل
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${contactType === "whatsapp" ? "border-green-600 bg-green-50 text-green-800 font-bold" : "border-gray-200 hover:border-green-300 hover:bg-green-50/30 text-gray-600"}`}
                    >
                      <input
                        type="radio"
                        name="contactType"
                        value="whatsapp"
                        className="sr-only"
                        onChange={() => setContactType("whatsapp")}
                        required
                      />
                      <span>واتساب</span>
                    </label>
                    <label
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${contactType === "call" ? "border-green-600 bg-green-50 text-green-800 font-bold" : "border-gray-200 hover:border-green-300 hover:bg-green-50/30 text-gray-600"}`}
                    >
                      <input
                        type="radio"
                        name="contactType"
                        value="call"
                        className="sr-only"
                        onChange={() => setContactType("call")}
                        required
                      />
                      <span>مكالمة</span>
                    </label>
                  </div>
                </div>

                {/* 👈 الحقول التي تظهر عند اختيار واتساب */}
                {contactType === "whatsapp" && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <label className="block mb-2 text-sm font-bold text-green-900">
                      إرفاق صور المحادثة{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        (يمكنك تحديد أكثر من صورة)
                      </span>
                    </label>
                    <input
                      type="file"
                      name="whatsappFiles"
                      accept="image/*"
                      multiple
                      className="w-full p-2 border-2 border-dashed border-green-200 rounded-xl bg-green-50/30 focus:outline-none focus:border-green-500 transition-all file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200 file:cursor-pointer file:font-bold text-sm text-gray-600"
                    />
                  </div>
                )}

                {/* 👈 الحقول التي تظهر عند اختيار مكالمة */}
                {contactType === "call" && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-300 bg-green-50/30 p-4 rounded-2xl border border-green-100">
                    <div>
                      <label className="block mb-2 text-sm font-bold text-green-900">
                        رقم العميل
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                        placeholder="05XXXXXXXX"
                        required
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-bold text-green-900">
                        وقت الاتصال
                      </label>
                      <input
                        type="datetime-local"
                        name="callTime"
                        className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm text-gray-600"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🟧 حقول "شركة الشحن سبل" */}
            {department === "sabl" && (
              <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                <div>
                  <label className="block mb-2 text-sm font-bold text-green-900">
                    نوع المشكلة
                  </label>
                  <select
                    name="issueType"
                    className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm text-gray-600"
                    required
                  >
                    <option value="">اختر نوع المشكلة</option>
                    <option value="عنوان غير صحيح">عنوان غير صحيح</option>
                    <option value="نقص في الطلب">نقص</option>
                    <option value="منتج مختلف">مختلف</option>
                    <option value="استرجاع جزئي">جزئي</option>
                    <option value="استرجاع كامل">كامل</option>
                  </select>
                </div>

                <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100 space-y-4">
                  <h3 className="font-bold text-green-900 text-sm mb-3">
                    بيانات النزيل
                  </h3>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      الاسم الرباعي
                    </label>
                    <input
                      name="inmateName"
                      type="text"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                      placeholder="الاسم الكامل"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      رقم الهوية
                    </label>
                    <input
                      name="inmateId"
                      type="text"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                      placeholder="رقم الهوية"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      السجن
                    </label>
                    <input
                      name="prisonName"
                      type="text"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                      placeholder="اسم السجن"
                      required
                    />
                  </div>
                </div>

                <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100 space-y-4">
                  <h3 className="font-bold text-green-900 text-sm mb-3">
                    البيانات البنكية
                  </h3>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      رقم الحساب (IBAN)
                    </label>
                    <input
                      name="iban"
                      type="text"
                      dir="ltr"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm text-left"
                      placeholder="SAXXXXXXXXXXXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      آخر 4 أرقام
                    </label>
                    <input
                      name="last4Digits"
                      type="text"
                      maxLength={4}
                      dir="ltr"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm text-center tracking-widest"
                      placeholder="XXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-green-800">
                      اسم صاحب الحساب
                    </label>
                    <input
                      name="accountName"
                      type="text"
                      className="w-full p-3 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                      placeholder="الاسم الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-green-900">
                    إرفاق البلاغ
                  </label>
                  <input
                    type="file"
                    name="file"
                    className="w-full p-2 border-2 border-dashed border-green-200 rounded-xl bg-green-50/30 focus:outline-none focus:border-green-500 transition-all file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200 file:cursor-pointer file:font-bold text-sm text-gray-600"
                    required
                  />
                </div>
              </div>
            )}

            {/* الحقل المشترك الدائم: تفاصيل الطلب */}
            <div className="pt-2 animate-in fade-in duration-500">
              <label className="block mb-2 text-sm font-bold text-green-900">
                تفاصيل الطلب / الملاحظات
              </label>
              <textarea
                name="orderDetails"
                rows={4}
                className="w-full p-3.5 border border-green-100 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none transition-all text-sm"
                placeholder="أدخل تفاصيل الطلب أو أي ملاحظات إضافية..."
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-green-800 via-emerald-700 to-green-700 hover:from-green-900 hover:via-green-800 hover:to-emerald-800 text-white py-4 rounded-2xl transition-all shadow-lg shadow-green-900/20 active:scale-[0.98] flex items-center justify-center gap-2 font-bold disabled:opacity-70 group mt-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الطلب</span>
                  <Send className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
