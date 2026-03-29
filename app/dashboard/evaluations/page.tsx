import { prisma } from "@/app/lib/prisma";
import EvaluationDatePicker from "@/app/components/evaluations/EvaluationDatePicker";
import RunAutoEvalButton from "@/app/components/evaluations/RunAutoEvalButton";
import { Calculator, Star, AlertTriangle, Bot } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AutoEvaluationsPage(props: Props) {
  const searchParams = await props.searchParams;

  // التحقق من التاريخ
  const dateStr =
    (searchParams.date as string) || new Date().toISOString().split("T")[0];

  // تحديد بداية ونهاية اليوم للبحث في قاعدة البيانات
  const startDate = new Date(dateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);

  // جلب التقييمات المحفوظة في قاعدة البيانات لهذا اليوم تحديداً
  const performances = await prisma.dailyPerformance.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    include: {
      user: { include: { department: true } },
    },
    orderBy: { score: "desc" }, // ترتيب من الأعلى للأقل
  });

  return (
    <div className="space-y-6 font-[Tajawal]" dir="rtl">
      {/* Header, Date Picker & AI Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="text-blue-600" />
            نظام التقييم الذكي
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            اضغط على الزر ليقوم النظام بحساب تقييمات الموظفين تلقائياً بناءً على
            إنجازاتهم اليوم.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <EvaluationDatePicker defaultDate={dateStr} />
          {/* الزر السحري الجديد */}
          <RunAutoEvalButton dateStr={dateStr} />
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performances.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot size={32} />
            </div>
            <p className="text-gray-600 font-bold text-lg mb-1">
              لا توجد تقييمات محسوبة لهذا اليوم
            </p>
            <p className="text-gray-400 text-sm">
              اضغط على زر "تشغيل التقييم الذكي" بالأعلى لإنشاء التقييمات فوراً.
            </p>
          </div>
        ) : (
          performances.map((perf) => (
            <div
              key={perf.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xl text-blue-700 shadow-inner">
                    {perf.user.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {perf.user.fullName}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                      {perf.user.department?.name || "بدون قسم"}
                    </p>
                  </div>
                </div>

                {/* Final Score Circle */}
                <div className="text-center flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black border-4 ${
                      perf.score >= 90
                        ? "border-green-500 text-green-600"
                        : perf.score >= 70
                          ? "border-blue-500 text-blue-600"
                          : perf.score > 0
                            ? "border-orange-500 text-orange-600"
                            : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {perf.score}%
                  </div>
                </div>
              </div>

              {/* Stats Body */}
              <div className="p-5 space-y-4">
                {/* Volume bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-600">
                      إجمالي المنجز اليوم
                    </span>
                    <span className="font-bold text-gray-900">
                      {perf.ordersPrepared || perf.callsCount || 0} مهام/شكاوى
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${(perf.qualityScore || 0) >= 80 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${perf.qualityScore || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Micro Scores */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <span className="block text-[10px] text-gray-500 font-bold mb-1">
                      السرعة
                    </span>
                    <span className="font-bold text-sm text-gray-800">
                      {perf.speedScore || 0}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <span className="block text-[10px] text-gray-500 font-bold mb-1">
                      الجودة
                    </span>
                    <span className="font-bold text-sm text-gray-800">
                      {perf.qualityScore || 0}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <span className="block text-[10px] text-gray-500 font-bold mb-1">
                      الانضباط
                    </span>
                    <span className="font-bold text-sm text-gray-800">
                      {perf.disciplineScore || 0}%
                    </span>
                  </div>
                </div>

                {/* AI Insight */}
                {perf.score === 0 && (
                  <div className="flex items-start gap-2 bg-orange-50 text-orange-700 p-3 rounded-lg text-xs font-medium border border-orange-100">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    لم يقم الموظف بإنجاز أي مهام مسندة إليه اليوم.
                  </div>
                )}
                {perf.score >= 90 && (
                  <div className="flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-xs font-medium border border-green-100">
                    <Star size={14} className="mt-0.5 flex-shrink-0" />
                    أداء ممتاز جداً! الموظف يستحق التكريم على الإنجاز.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
