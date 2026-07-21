"use client";

import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import WorkforceHeaderNav from "./WorkforceHeaderNav";
import {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useAssignShiftMutation,
  useRequestSwapMutation,
  useUpdateSwapStatusMutation,
} from "@/redux/slices/shiftApiSlice";
import { useGetEmployeesQuery } from "@/redux/slices/employeeApiSlice";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  XCircle,
  X,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DEMO_SHIFTS = [
  {
    id: "shift-1",
    name: "Morning Rush",
    startTime: "08:00",
    endTime: "16:00",
    assignments: [
      { id: "a1", date: "2026-07-21", employee: { id: "demo-1", name: "Rohan Sharma" } },
      { id: "a2", date: "2026-07-21", employee: { id: "demo-2", name: "Priya Patel" } },
    ],
    swapRequests: [],
  },
  {
    id: "shift-2",
    name: "Evening Shift",
    startTime: "16:00",
    endTime: "00:00",
    assignments: [
      { id: "a3", date: "2026-07-21", employee: { id: "demo-3", name: "Amit Kumar" } },
    ],
    swapRequests: [
      {
        id: "s1",
        fromEmployeeId: "demo-3",
        toEmployeeId: "demo-2",
        shiftId: "shift-2",
        date: "2026-07-21",
        status: "REQUESTED",
      },
    ],
  },
];

export default function ShiftSchedulerPage() {
  const { data: shiftApiData, isLoading: isShiftsLoading } = useGetShiftsQuery(undefined);
  const { data: empApiData } = useGetEmployeesQuery(undefined);

  const [createShift, { isLoading: isCreatingShift }] = useCreateShiftMutation();
  const [assignShift, { isLoading: isAssigning }] = useAssignShiftMutation();
  const [requestSwap, { isLoading: isSwapping }] = useRequestSwapMutation();
  const [updateSwapStatus, { isLoading: isUpdatingSwap }] = useUpdateSwapStatusMutation();

  const shifts = shiftApiData?.data || (isShiftsLoading ? [] : DEMO_SHIFTS);
  const employees = empApiData?.data || [
    { id: "demo-1", name: "Rohan Sharma" },
    { id: "demo-2", name: "Priya Patel" },
    { id: "demo-3", name: "Amit Kumar" },
  ];

  // Modals
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Forms
  const [shiftForm, setShiftForm] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
  });

  const [assignForm, setAssignForm] = useState({
    shiftId: "",
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [swapForm, setSwapForm] = useState({
    fromEmployeeId: "",
    toEmployeeId: "",
    shiftId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleCreateShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShift(shiftForm).unwrap();
      setFeedbackMsg("New shift timing created successfully!");
      setShowCreateShiftModal(false);
      setShiftForm({ name: "", startTime: "09:00", endTime: "17:00" });
    } catch (err: any) {
      setFeedbackMsg(err?.data?.message || "Failed to create shift");
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.shiftId || !assignForm.employeeId) return;
    try {
      await assignShift(assignForm).unwrap();
      setFeedbackMsg("Shift assigned to employee successfully!");
      setShowAssignModal(false);
    } catch (err: any) {
      setFeedbackMsg(err?.data?.message || "Failed to assign shift (Check for overlap)");
    }
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestSwap(swapForm).unwrap();
      setFeedbackMsg("Swap request submitted successfully!");
      setShowSwapModal(false);
    } catch (err: any) {
      setFeedbackMsg(err?.data?.message || "Failed to request shift swap");
    }
  };

  const handleSwapAction = async (swapId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateSwapStatus({ swapId, status }).unwrap();
      setFeedbackMsg(`Swap request ${status.toLowerCase()}!`);
    } catch (err: any) {
      setFeedbackMsg(err?.data?.message || `Failed to update swap status`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shift Scheduler & Roster</h1>
            <p className="text-sm text-gray-500">
              Create shifts, assign staff members, and manage shift swap requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSwapModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Request Swap
            </button>
            <button
              onClick={() => setShowCreateShiftModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Shift Slot
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D3232A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              Assign Shift
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <WorkforceHeaderNav />

        {/* Feedback Message Banner */}
        {feedbackMsg && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Shift Roster Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isShiftsLoading ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              Loading shifts roster...
            </div>
          ) : shifts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              No shifts created yet. Click "New Shift Slot" to configure employee shifts.
            </div>
          ) : (
            shifts.map((shift: any) => (
              <div
                key={shift.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{shift.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#D3232A]">
                    {shift.assignments?.length || 0} Assigned
                  </span>
                </div>

                {/* Assigned Staff List */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Assigned Employees
                  </p>
                  {!shift.assignments || shift.assignments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No employees assigned to this slot.</p>
                  ) : (
                    <div className="space-y-2">
                      {shift.assignments.map((asgn: any) => (
                        <div
                          key={asgn.id || asgn.employee?.id}
                          className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-[#D3232A]/10 text-[#D3232A] flex items-center justify-center font-bold text-xs">
                              {asgn.employee?.name?.[0] || "E"}
                            </div>
                            <span className="font-medium text-gray-800">
                              {asgn.employee?.name || "Staff Member"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Today</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Assign Button */}
                <button
                  onClick={() => {
                    setAssignForm({
                      ...assignForm,
                      shiftId: shift.id,
                    });
                    setShowAssignModal(true);
                  }}
                  className="w-full py-2 text-xs font-medium text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  + Add Employee to {shift.name}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Swap Requests Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pending Shift Swap Requests</h2>
              <p className="text-xs text-gray-500">
                Staff members requesting to exchange assigned shifts.
              </p>
            </div>
            <ArrowRightLeft className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {shifts.flatMap((s: any) => s.swapRequests || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No active shift swap requests right now.
              </p>
            ) : (
              shifts
                .flatMap((s: any) => s.swapRequests || [])
                .map((swap: any) => (
                  <div
                    key={swap.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <span>Swap Request #{swap.id.slice(0, 6)}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            swap.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : swap.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {swap.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Requested on date: {new Date(swap.date).toLocaleDateString()}
                      </p>
                    </div>

                    {swap.status === "REQUESTED" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSwapAction(swap.id, "APPROVED")}
                          disabled={isUpdatingSwap}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleSwapAction(swap.id, "REJECTED")}
                          disabled={isUpdatingSwap}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Modal 1: Create Shift */}
        {showCreateShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Create Shift Timing</h3>
                <button onClick={() => setShowCreateShiftModal(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleCreateShiftSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Shift, Evening Rush"
                    value={shiftForm.name}
                    onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time (HH:MM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="08:00"
                      value={shiftForm.startTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (HH:MM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="16:00"
                      value={shiftForm.endTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateShiftModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingShift}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#D3232A] hover:bg-[#b01e23] rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {isCreatingShift ? "Saving..." : "Create Shift Slot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Assign Shift */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Assign Employee Shift</h3>
                <button onClick={() => setShowAssignModal(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Shift
                  </label>
                  <select
                    required
                    value={assignForm.shiftId}
                    onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  >
                    <option value="">-- Select Shift Slot --</option>
                    {shifts.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Employee
                  </label>
                  <select
                    required
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  >
                    <option value="">-- Select Staff Member --</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={assignForm.date}
                    onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#D3232A] hover:bg-[#b01e23] rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {isAssigning ? "Assigning..." : "Assign Shift"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Request Swap */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Request Shift Swap</h3>
                <button onClick={() => setShowSwapModal(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSwapSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Employee (Assigned)
                  </label>
                  <select
                    required
                    value={swapForm.fromEmployeeId}
                    onChange={(e) => setSwapForm({ ...swapForm, fromEmployeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  >
                    <option value="">-- Select Source Employee --</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Employee (Replacement)
                  </label>
                  <select
                    required
                    value={swapForm.toEmployeeId}
                    onChange={(e) => setSwapForm({ ...swapForm, toEmployeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  >
                    <option value="">-- Select Replacement Employee --</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Slot
                  </label>
                  <select
                    required
                    value={swapForm.shiftId}
                    onChange={(e) => setSwapForm({ ...swapForm, shiftId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  >
                    <option value="">-- Select Shift --</option>
                    {shifts.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={swapForm.date}
                    onChange={(e) => setSwapForm({ ...swapForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D3232A]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowSwapModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSwapping}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#D3232A] hover:bg-[#b01e23] rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {isSwapping ? "Submitting..." : "Submit Swap Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
