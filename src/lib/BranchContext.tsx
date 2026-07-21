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

export const ALL_OUTLETS_BRANCH: Branch = {
  id: "all",
  name: "All Outlets",
  address: "All Locations Overview",
  tenantId: "all",
};

const DEMO_BRANCHES: Branch[] = [
  ALL_OUTLETS_BRANCH,
  { id: "demo-soho", name: "London Soho", address: "12 Wardour St, London", tenantId: "demo-tenant" },
  { id: "demo-deansgate", name: "Manchester Deansgate", address: "123 Deansgate, Manchester", tenantId: "demo-tenant" },
  { id: "demo-bullring", name: "Birmingham Bullring", address: "Bullring Shopping Centre, Birmingham", tenantId: "demo-tenant" },
  { id: "demo-victoria", name: "Leeds Victoria", address: "Victoria Gate, Leeds", tenantId: "demo-tenant" }
];

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(ALL_OUTLETS_BRANCH);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const refreshBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBranches();
      if (data && data.length > 0) {
        const fullBranchList = [ALL_OUTLETS_BRANCH, ...data];
        setBranches(fullBranchList);
        setIsDemo(false);
        
        // Restore active branch selection from localstorage if valid
        const savedId = localStorage.getItem("alayn_active_branch_id");
        const matched = fullBranchList.find((b) => b.id === savedId);
        const nextBranch = matched || ALL_OUTLETS_BRANCH;
        setActiveBranchState(nextBranch);
        localStorage.setItem("alayn_active_branch_id", nextBranch.id);
      } else {
        const token = localStorage.getItem("alayn_access_token");
        if (token) {
          setBranches([ALL_OUTLETS_BRANCH]);
          setActiveBranchState(ALL_OUTLETS_BRANCH);
          setIsDemo(false);
        } else {
          setBranches(DEMO_BRANCHES);
          setActiveBranchState(ALL_OUTLETS_BRANCH);
          setIsDemo(true);
        }
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
      setBranches(DEMO_BRANCHES);
      setActiveBranchState(ALL_OUTLETS_BRANCH);
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
