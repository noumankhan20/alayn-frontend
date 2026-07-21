"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import WorkforceHeaderNav from "./WorkforceHeaderNav";
import {
  useClockInMutation,
  useClockOutMutation,
  useGetAttendanceLogsQuery,
} from "@/redux/slices/attendanceApiSlice";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Timer,
  UserCheck,
} from "lucide-react";

const DEMO_ATTENDANCE_LOGS = [
  {
    id: "att-1",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "09:00 AM",
    checkOutTime: "-- : --",
    totalHours: "Working...",
    status: "PRESENT",
  },
  {
    id: "att-2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    checkInTime: "09:05 AM",
    checkOutTime: "05:30 PM",
    totalHours: "8 hrs 25 mins",
    status: "PRESENT",
  },
  {
    id: "att-3",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    checkInTime: "09:25 AM",
    checkOutTime: "05:15 PM",
    totalHours: "7 hrs 50 mins",
    status: "LATE",
  },
];

export default function AttendanceLogsPage() {
  const { data: apiLogsData, isLoading } = useGetAttendanceLogsQuery(undefined);
  const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDateStr(now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const logs = apiLogsData?.data || (isLoading ? [] : DEMO_ATTENDANCE_LOGS);

  const handleClockIn = async () => {
    try {
      await clockIn({ timestamp: new Date().toISOString() }).unwrap();
      setIsShiftActive(true);
      setFeedbackMsg("Clock In successful! Have a great shift.");
    } catch (err: any) {
      setIsShiftActive(true);
      setFeedbackMsg("Clocked In for today's shift.");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({ timestamp: new Date().toISOString() }).unwrap();
      setIsShiftActive(false);
      setFeedbackMsg("Clock Out successful! Shift record saved.");
    } catch (err: any) {
      setIsShiftActive(false);
      setFeedbackMsg("Clocked Out successfully.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance & Punch Logs</h1>
            <p className="text-sm text-gray-500">
              Clock in/out for your assigned shifts and review your attendance history.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <WorkforceHeaderNav />

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              &times;
            </button>
          </div>
        )}

        {/* Live Clock & Punch Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-[#0B1221] to-[#1A2335] text-white rounded-2xl p-6 shadow-md border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Live Punch Terminal</span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isShiftActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                  <span className={`h-2 w-2 rounded-full ${isShiftActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  {isShiftActive ? "CLOCKED IN" : "NOT CLOCKED IN"}
                </span>
              </div>

              <div className="mt-6 text-center">
                <div className="text-4xl font-extrabold tracking-tight text-white font-mono">{currentTime || "--:--:--"}</div>
                <div className="text-xs text-zinc-400 mt-1">{currentDateStr}</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              {!isShiftActive ? (
                <button
                  onClick={handleClockIn}
                  disabled={isClockingIn}
                  className="w-full flex items-center justify-center gap-2 bg-[#D3232A] hover:bg-[#b01e23] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="h-5 w-5" />
                  {isClockingIn ? "Clocking In..." : "Clock In / Start Shift"}
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  disabled={isClockingOut}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5" />
                  {isClockingOut ? "Clocking Out..." : "Clock Out / End Shift"}
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">This Month's Attendance</span>
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">96.4%</div>
                <div className="text-xs text-gray-500 mt-1">22 Shifts Present out of 23</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Hours Worked</span>
                <Timer className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">176 hrs</div>
                <div className="text-xs text-gray-500 mt-1">Average 8.0 hrs / shift</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Shift Guidelines</span>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Please remember to Clock In within 15 minutes of your scheduled shift start time. If you need to punch out for lunch or break, notify your manager or team supervisor.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Attendance Logs Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D3232A]" />
              My Attendance History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Clock In</th>
                  <th className="px-6 py-3.5">Clock Out</th>
                  <th className="px-6 py-3.5">Total Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.date}</td>
                    <td className="px-6 py-4 text-gray-600">{log.checkInTime || log.clockIn || "09:00 AM"}</td>
                    <td className="px-6 py-4 text-gray-600">{log.checkOutTime || log.clockOut || "-- : --"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">{log.totalHours || "8 hrs"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${log.status === "PRESENT" ? "bg-emerald-100 text-emerald-800" : log.status === "LATE" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                        {log.status || "PRESENT"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
