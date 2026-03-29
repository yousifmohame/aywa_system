"use client";

import { useState, useTransition, useEffect } from "react";
import { employeeAttendanceAction } from "@/app/actions/attendance";
import { LogIn, Clock, AlertCircle, CheckCircle2, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  todayPerf: any;
  settings: any;
  employee?: any;
}

export default function AttendanceCard({
  userId,
  todayPerf,
  settings,
  employee,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = !!todayPerf?.checkIn;
  const isCheckedOut = !!todayPerf?.checkOut; // الحقل الذي يمتلئ عبر محرك التقييم

  const workStartTimeStr =
    employee?.customStartTime || settings?.workStartTime || "09:00";
  const workEndTimeStr =
    employee?.customEndTime || settings?.workEndTime || "17:00";

  const expectedStartTime = new Date();
  const [startHour, startMinute] = workStartTimeStr.split(":").map(Number);
  expectedStartTime.setHours(startHour, startMinute, 0, 0);

  const isTimeForCheckIn = currentTime >= expectedStartTime;

  const handleAttendance = () => {
    setError("");
    if (!isTimeForCheckIn) {
      setError(`لا يمكنك تسجيل الحضور قبل الساعة ${workStartTimeStr}`);
      return;
    }
    startTransition(async () => {
      const result = await employeeAttendanceAction(userId);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            تسجيل الدوام
          </h3>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded font-mono">
            الدوام: {workStartTimeStr} - {workEndTimeStr}
          </span>
        </div>

        <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 font-bold">وقت الحضور:</span>
            <span
              className={`font-bold font-mono ${isCheckedIn ? "text-green-600" : "text-gray-400"}`}
            >
              {isCheckedIn ? formatTime(todayPerf.checkIn) : "--:--"}
            </span>
          </div>
          {/* عرض وقت الانصراف التلقائي إذا تمت معالجته من المدير */}
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
            <span className="text-gray-500 font-bold">وقت الانصراف:</span>
            <span
              className={`font-bold font-mono ${isCheckedOut ? "text-purple-600" : "text-gray-300"}`}
            >
              {isCheckedOut ? formatTime(todayPerf.checkOut) : "--:--"}
            </span>
          </div>
        </div>
      </div>

      <div>
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-[10px] rounded-lg flex items-center gap-1 font-bold border border-red-100">
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        {isCheckedOut ? (
          /* الحالة 1: تم الانصراف (إغلاق اليوم من المدير) */
          <div className="w-full bg-purple-50 text-purple-700 py-3 rounded-lg flex flex-col items-center justify-center gap-1 text-sm font-bold border border-purple-200 shadow-inner">
            <Moon size={24} className="text-purple-500" />
            <span>انتهى دوام اليوم</span>
            <span className="text-[10px] text-purple-600 font-normal">
              تم احتساب الساعات والتقييم بنجاح
            </span>
          </div>
        ) : isCheckedIn ? (
          /* الحالة 2: سجل حضور والدوام مستمر */
          <div className="w-full bg-green-50 text-green-700 py-3 rounded-lg flex flex-col items-center justify-center gap-1 text-sm font-bold border border-green-200 animate-pulse">
            <CheckCircle2 size={24} className="text-green-500" />
            <span>أنت الآن في فترة الدوام</span>
            <span className="text-[10px] text-green-600 font-normal">
              يتم تسجيل الانصراف تلقائياً عند انتهاء الوردية
            </span>
          </div>
        ) : (
          /* الحالة 3: لم يسجل حضور بعد */
          <button
            onClick={handleAttendance}
            disabled={isPending || !isTimeForCheckIn}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all ${
              !isTimeForCheckIn
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            } ${isPending ? "opacity-70 cursor-wait" : ""}`}
          >
            {isPending ? (
              "جاري التسجيل..."
            ) : !isTimeForCheckIn ? (
              <>
                {" "}
                <Clock size={18} /> انتظر حتى {workStartTimeStr}{" "}
              </>
            ) : (
              <>
                {" "}
                <LogIn size={18} /> تسجيل حضور الآن{" "}
              </>
            )}
          </button>
        )}

        {!isCheckedIn && !isTimeForCheckIn && (
          <p className="text-center text-[10px] text-gray-400 mt-2 font-bold">
            الوقت الحالي: {formatTime(currentTime)}
          </p>
        )}
      </div>
    </div>
  );
}
