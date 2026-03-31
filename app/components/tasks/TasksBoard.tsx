"use client";

import { useState } from "react";
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  X,
  AlignLeft,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import TaskItem from "@/app/components/tasks/TaskItem";

type Props = {
  pendingTasks: any[];
  progressTasks: any[];
  completedTasks: any[];
  canManage: boolean;
};

export default function TasksBoard({
  pendingTasks,
  progressTasks,
  completedTasks,
  canManage,
}: Props) {
  // حالة التبويب النشط للموبايل
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "PROGRESS" | "COMPLETED"
  >("PENDING");

  // حالة النافذة المنبثقة (Modal) لعرض تفاصيل المهمة
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // دالة لتحديد لون واسم الحالة داخل الـ Modal
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "تم الإنجاز",
          color: "bg-green-100 text-green-700 border-green-200",
        };
      case "PROGRESS":
        return {
          label: "جاري العمل",
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          label: "قيد الانتظار",
          color: "bg-orange-100 text-orange-700 border-orange-200",
        };
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 1. Mobile Tabs Switcher */}
      <div className="md:hidden flex p-1 bg-gray-100 rounded-lg mb-4 mx-1">
        <TabButton
          label="الانتظار"
          count={pendingTasks.length}
          isActive={activeTab === "PENDING"}
          onClick={() => setActiveTab("PENDING")}
          activeColor="bg-white text-orange-600 shadow-sm"
          icon={Clock}
        />
        <TabButton
          label="جاري العمل"
          count={progressTasks.length}
          isActive={activeTab === "PROGRESS"}
          onClick={() => setActiveTab("PROGRESS")}
          activeColor="bg-white text-blue-600 shadow-sm"
          icon={PlayCircle}
        />
        <TabButton
          label="المكتملة"
          count={completedTasks.length}
          isActive={activeTab === "COMPLETED"}
          onClick={() => setActiveTab("COMPLETED")}
          activeColor="bg-white text-green-600 shadow-sm"
          icon={CheckCircle2}
        />
      </div>

      {/* 2. Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-hidden min-h-0">
        {/* Column 1: Pending */}
        <div
          className={`${activeTab === "PENDING" ? "block" : "hidden"} md:block h-full overflow-hidden`}
        >
          <TaskColumn
            title="قيد الانتظار"
            count={pendingTasks.length}
            icon={Clock}
            color="bg-orange-50 text-orange-700"
            borderColor="border-orange-200"
          >
            {pendingTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer hover:ring-2 hover:ring-orange-300 rounded-xl transition-all"
              >
                <TaskItem task={task} canManage={canManage} />
              </div>
            ))}
          </TaskColumn>
        </div>

        {/* Column 2: In Progress */}
        <div
          className={`${activeTab === "PROGRESS" ? "block" : "hidden"} md:block h-full overflow-hidden`}
        >
          <TaskColumn
            title="جاري العمل"
            count={progressTasks.length}
            icon={PlayCircle}
            color="bg-blue-50 text-blue-700"
            borderColor="border-blue-200"
          >
            {progressTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded-xl transition-all"
              >
                <TaskItem task={task} canManage={canManage} />
              </div>
            ))}
          </TaskColumn>
        </div>

        {/* Column 3: Completed */}
        <div
          className={`${activeTab === "COMPLETED" ? "block" : "hidden"} md:block h-full overflow-hidden`}
        >
          <TaskColumn
            title="تم الإنجاز"
            count={completedTasks.length}
            icon={CheckCircle2}
            color="bg-green-50 text-green-700"
            borderColor="border-green-200"
          >
            {completedTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer hover:ring-2 hover:ring-green-300 rounded-xl transition-all"
              >
                <TaskItem task={task} canManage={canManage} />
              </div>
            ))}
          </TaskColumn>
        </div>
      </div>

      {/* 3. Task Details Modal (النافذة المنبثقة) */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-[Tajawal]"
          dir="rtl"
          onClick={() => setSelectedTask(null)} // الإغلاق عند الضغط خارج النافذة
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // منع الإغلاق عند الضغط داخل النافذة
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" />
                تفاصيل المهمة
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* العنوان والحالة */}
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900 mb-3">
                  {selectedTask.title}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusInfo(selectedTask.status).color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${selectedTask.status === "COMPLETED" ? "bg-green-500" : selectedTask.status === "PROGRESS" ? "bg-blue-500" : "bg-orange-500"}`}
                  ></span>
                  {getStatusInfo(selectedTask.status).label}
                </span>
              </div>

              {/* الوصف */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-2">
                  <AlignLeft size={16} className="text-gray-400" />
                  الوصف والتفاصيل
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description ||
                    "لا يوجد وصف أو تفاصيل إضافية مسجلة لهذه المهمة."}
                </p>
              </div>

              {/* معلومات إضافية (تاريخ ومسؤول) */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTask.assignedTo && (
                  <div className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <User size={12} /> المسند إليه
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {selectedTask.assignedTo.fullName}
                    </span>
                  </div>
                )}

                {selectedTask.dueDate && (
                  <div className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} /> تاريخ التسليم
                    </span>
                    <span
                      className={`text-sm font-bold ${new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== "COMPLETED" ? "text-red-600" : "text-gray-800"}`}
                    >
                      {new Date(selectedTask.dueDate).toLocaleDateString(
                        "ar-EG",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono text-center">
                تاريخ الإنشاء:{" "}
                {new Date(selectedTask.createdAt).toLocaleString("ar-EG")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// مكون الزر الخاص بالموبايل
function TabButton({
  label,
  count,
  isActive,
  onClick,
  activeColor,
  icon: Icon,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-bold transition-all duration-200
        ${isActive ? activeColor : "text-gray-500 hover:bg-gray-200/50"}`}
    >
      <Icon size={14} />
      {label}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? "bg-gray-100" : "bg-gray-200"}`}
      >
        {count}
      </span>
    </button>
  );
}

// مكون العمود
function TaskColumn({
  title,
  count,
  icon: Icon,
  color,
  borderColor,
  children,
}: any) {
  return (
    <div
      className={`flex flex-col h-full bg-gray-50/50 md:bg-gray-50/50 rounded-xl border ${borderColor} overflow-hidden shadow-sm`}
    >
      <div
        className={`p-3 flex items-center justify-between border-b ${borderColor} ${color} bg-opacity-20`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Icon size={16} />
          {title}
        </div>
        <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide space-y-3">
        {children}
        {count === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <Icon size={40} className="mb-2 opacity-20" />
            <p className="text-xs">لا توجد مهام</p>
          </div>
        )}
      </div>
    </div>
  );
}
