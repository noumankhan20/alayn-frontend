"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Branch, fetchBranches } from "./api";

interface BranchContextType {
  activeBranch: Branch | null;
  setActiveBranch: (branch: Branch | null) => void;
  branches: Branch[];
  loading: boolean;
  isDemo: boolean;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

const DEMO_BRANCHES: Branch[] = [
  { id: "demo-soho", name: "London Soho", address: "12 Wardour St, London", businessId: "demo-business" },
  { id: "demo-deansgate", name: "Manchester Deansgate", address: "123 Deansgate, Manchester", businessId: "demo-business" },
  { id: "demo-bullring", name: "Birmingham Bullring", address: "Bullring Shopping Centre, Birmingham", businessId: "demo-business" },
  { id: "demo-victoria", name: "Leeds Victoria", address: "Victoria Gate, Leeds", businessId: "demo-business" }
];

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const refreshBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBranches();
      if (data && data.length > 0) {
        setBranches(data);
        setIsDemo(false);
        
        // Restore active branch selection from localstorage if valid
        const savedId = localStorage.getItem("alayn_active_branch_id");
        const matched = data.find((b) => b.id === savedId);
        const nextBranch = matched || data[0];
        setActiveBranchState(nextBranch);
        localStorage.setItem("alayn_active_branch_id", nextBranch.id);
      } else {
        // If logged in but no branches are returned, we don't fall back to demo automatically,
        // we keep branches empty so they can register their first outlet.
        // Wait, how do we know if we are logged in? If getAccessToken() exists.
        const token = localStorage.getItem("alayn_access_token");
        if (token) {
          setBranches([]);
          setActiveBranchState(null);
          setIsDemo(false);
        } else {
          // If no token, we are in Demo mode (public landing pages / demo view)
          setBranches(DEMO_BRANCHES);
          setActiveBranchState(DEMO_BRANCHES[0]);
          setIsDemo(true);
        }
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
      setBranches(DEMO_BRANCHES);
      setActiveBranchState(DEMO_BRANCHES[0]);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const setActiveBranch = (branch: Branch | null) => {
    setActiveBranchState(branch);
    if (branch) {
      localStorage.setItem("alayn_active_branch_id", branch.id);
    } else {
      localStorage.removeItem("alayn_active_branch_id");
    }
  };

  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch, branches, loading, isDemo, refreshBranches }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
