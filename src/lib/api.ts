// Frontend API Client — Alayn Backend
// All branch-scoped calls accept outletId explicitly (from BranchContext).

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const TOKEN_KEY = "alayn_access_token";

// ── Token management (SSR-safe) ───────────────────────────────────────────────

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function writeToken(tok: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(TOKEN_KEY, tok); } catch { /* noop */ }
}

/** Returns the cached access token or fetches a fresh one via the dev login. */
export async function getAccessToken(): Promise<string | null> {
  const cached = readToken();
  if (cached) return cached;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner@alayn.com", password: "password123" }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const tok: string = body?.data?.accessToken ?? body?.accessToken ?? "";
    if (tok) writeToken(tok);
    return tok || null;
  } catch {
    return null;
  }
}

// ── Shared request helper ─────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  outletId?: string;
}

async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Not authenticated" };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.outletId) headers["x-outlet-id"] = opts.outletId;

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 403) {
        return {
          ok: false,
          error: "You do not have access to this branch.",
          status: 403,
        };
      }
      return {
        ok: false,
        error:
          json?.message ??
          json?.error ??
          `Request failed (HTTP ${res.status})`,
        status: res.status,
      };
    }

    // Backend wraps data in { success, data, ... }
    return { ok: true, data: (json?.data ?? json) as T };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: msg };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string;
  businessId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderThreshold: number;
  unitCostPaise: number;
  currentStock: number;
  createdAt?: string;
}

export interface InventoryListResult {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Fallback / mock data ──────────────────────────────────────────────────────

interface BackendOutletComparison {
  outletId: string;
  outletName: string;
  totalCompletedOrders: number;
  totalSalesPaise: number;
}

interface BackendDailySummary {
  id: string;
  date: string;
  grossSalesPaise: number;
  cogsPaise: number;
  grossProfitPaise: number;
  orderCount: number;
  itemBreakdownJson: string;
  outletId: string;
}

export interface LocationData {
  name: string;
  sales: string;
  variance: string;
  varianceType: "positive" | "negative" | "neutral";
  labour: string;
  labourWarning?: boolean;
  gp: string;
  orders: string;
  status: "ON TRACK" | "ACTION NEEDED" | "WATCH";
}

export const fallbackData = {
  kpis: {
    netSales: { value: "₹482,192", trend: "+4.2%", type: "positive" as const },
    transactions: { value: "24,510", trend: "+2.8%", type: "positive" as const },
    avgOrderValue: { value: "₹19.67", trend: "-1.2%", type: "negative" as const },
    salesVsForecast: { value: "102.4%", trend: "Ahead", type: "positive" as const },
    salesVsLy: { value: "+8.4%", trend: "YoY", type: "positive" as const },
  },
  chart: [
    { name: "Mon", actual: 230, forecast: 250, lastYear: 210 },
    { name: "Tue", actual: 280, forecast: 260, lastYear: 230 },
    { name: "Wed", actual: 320, forecast: 300, lastYear: 280 },
    { name: "Thu", actual: 290, forecast: 280, lastYear: 260 },
    { name: "Fri", actual: 360, forecast: 330, lastYear: 310 },
    { name: "Sat", actual: 400, forecast: 380, lastYear: 350 },
    { name: "Sun", actual: 380, forecast: 350, lastYear: 330 },
  ],
  locations: [
    { name: "London Soho", sales: "₹42,840", variance: "+2.4%", varianceType: "positive" as const, labour: "25.4%", gp: "68.2%", orders: "1,204", status: "ON TRACK" as const },
    { name: "Manchester Deansgate", sales: "₹31,200", variance: "-4.1%", varianceType: "negative" as const, labour: "30.2%", labourWarning: true, gp: "64.1%", orders: "948", status: "ACTION NEEDED" as const },
    { name: "Birmingham Bullring", sales: "₹38,650", variance: "+12.4%", varianceType: "positive" as const, labour: "24.1%", gp: "69.5%", orders: "1,120", status: "ON TRACK" as const },
    { name: "Leeds Victoria", sales: "₹28,400", variance: "--", varianceType: "neutral" as const, labour: "28.2%", gp: "65.8%", orders: "812", status: "WATCH" as const },
  ] as LocationData[],
  summary: {
    openLocations: "14 / 14",
    teamMembers: "186",
    tasksCompleted: "42 / 48 (87.5%)",
    criticalIssues: "1",
  },
};

const FALLBACK_INVENTORY: InventoryItem[] = [
  { id: "1", name: "Premium Espresso Beans", sku: "COF-ESP-001", category: "Beverages", unit: "kg", reorderThreshold: 10, unitCostPaise: 120000, currentStock: 24 },
  { id: "2", name: "Whole Milk", sku: "MILK-WHL-002", category: "Dairy", unit: "L", reorderThreshold: 15, unitCostPaise: 8000, currentStock: 8 },
  { id: "3", name: "Oat Milk (Barista Edition)", sku: "MILK-OAT-003", category: "Dairy", unit: "L", reorderThreshold: 10, unitCostPaise: 18000, currentStock: 18 },
  { id: "4", name: "Caramel Syrup", sku: "SYR-CAR-004", category: "Syrups", unit: "Bottle", reorderThreshold: 5, unitCostPaise: 45000, currentStock: 3 },
  { id: "5", name: "Paper Cups 12oz", sku: "PKG-CUP-12OZ", category: "Packaging", unit: "pack", reorderThreshold: 8, unitCostPaise: 65000, currentStock: 12 },
  { id: "6", name: "Chocolate Chips", sku: "BAK-CHP-006", category: "Bakery", unit: "kg", reorderThreshold: 4, unitCostPaise: 50000, currentStock: 5 },
  { id: "7", name: "Butter Croissant (Frozen)", sku: "BAK-CRO-007", category: "Bakery", unit: "pcs", reorderThreshold: 50, unitCostPaise: 4500, currentStock: 120 },
];

// ── Branches API ──────────────────────────────────────────────────────────────

export async function fetchBranches(): Promise<Branch[]> {
  const result = await apiRequest<Branch[]>("/inventory/branches");
  if (result.ok) return result.data;
  console.warn("fetchBranches failed:", result.error);
  return [];
}

/** Returns the outlet used by the single-outlet inventory screen. */
export async function fetchDefaultInventoryOutletId(): Promise<string | null> {
  const outlets = await fetchBranches();
  return outlets[0]?.id ?? null;
}

// ── Performance / Analytics ───────────────────────────────────────────────────

export async function fetchPerformanceData() {
  const token = await getAccessToken();
  if (!token) return fallbackData;

  try {
    const comparisonRes = await fetch(`${BACKEND_URL}/analytics/outlet-comparison`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!comparisonRes.ok) throw new Error("Failed to fetch outlet comparisons");

    const comparisonBody = await comparisonRes.json();
    const comparisonList: BackendOutletComparison[] = comparisonBody.data || [];

    const locations = comparisonList.map((item) => {
      const salesVal = item.totalSalesPaise / 100;
      const targetSales = salesVal * (0.95 + Math.random() * 0.1);
      const varianceVal = ((salesVal - targetSales) / targetSales) * 100;
      const labourPercent = 22 + Math.random() * 9;
      const gpPercent = 60 + Math.random() * 12;
      const isRedLabour = labourPercent > 30;

      let status: "ON TRACK" | "ACTION NEEDED" | "WATCH" = "ON TRACK";
      if (varianceVal < -3 || isRedLabour) status = "ACTION NEEDED";
      else if (varianceVal < 0 || labourPercent > 28) status = "WATCH";

      return {
        name: item.outletName,
        sales: `₹${salesVal.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`,
        variance: `${varianceVal >= 0 ? "+" : ""}${varianceVal.toFixed(1)}%`,
        varianceType: varianceVal >= 0 ? ("positive" as const) : ("negative" as const),
        labour: `${labourPercent.toFixed(1)}%`,
        labourWarning: isRedLabour,
        gp: `${gpPercent.toFixed(1)}%`,
        orders: item.totalCompletedOrders.toLocaleString(),
        status,
      };
    });

    let chartData = fallbackData.chart;
    let netSalesTotal = 284620;
    let orderTotalCount = 3112;

    if (comparisonList.length > 0) {
      const activeOutletId = comparisonList[0].outletId;
      const dailyRes = await fetch(
        `${BACKEND_URL}/analytics/daily-summary?outletId=${activeOutletId}`,
        { headers: { Authorization: `Bearer ${token}`, "x-outlet-id": activeOutletId } },
      );

      if (dailyRes.ok) {
        const dailyBody = await dailyRes.json();
        const dailyList: BackendDailySummary[] = dailyBody.data || [];
        if (dailyList.length > 0) {
          netSalesTotal = dailyList.reduce((s, i) => s + i.grossSalesPaise, 0) / 100;
          orderTotalCount = dailyList.reduce((s, i) => s + i.orderCount, 0);
          const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          chartData = daysOfWeek.map((day, idx) => {
            const backendItem = dailyList[idx % dailyList.length];
            const actualVal = backendItem ? backendItem.grossSalesPaise / 10000 : 200 + Math.random() * 200;
            return {
              name: day,
              actual: Math.round(actualVal),
              forecast: Math.round(actualVal * (0.95 + Math.random() * 0.1)),
              lastYear: Math.round(actualVal * (0.85 + Math.random() * 0.15)),
            };
          });
        }
      }
    }

    const avgValue = orderTotalCount > 0 ? netSalesTotal / orderTotalCount : 19.67;
    return {
      kpis: {
        netSales: { value: `₹${Math.round(netSalesTotal).toLocaleString()}`, trend: "+4.2%", type: "positive" as const },
        transactions: { value: orderTotalCount.toLocaleString(), trend: "+2.8%", type: "positive" as const },
        avgOrderValue: { value: `₹${avgValue.toFixed(2)}`, trend: "-1.2%", type: "negative" as const },
        salesVsForecast: { value: "102.4%", trend: "Ahead", type: "positive" as const },
        salesVsLy: { value: "+8.4%", trend: "YoY", type: "positive" as const },
      },
      chart: chartData,
      locations: locations.length > 0 ? (locations as LocationData[]) : fallbackData.locations,
      summary: {
        openLocations: `${comparisonList.length} / ${comparisonList.length}`,
        teamMembers: "186",
        tasksCompleted: "42 / 48 (87.5%)",
        criticalIssues: "1",
      },
    };
  } catch (err) {
    console.warn("Error loading performance data, using fallbacks:", err);
    return fallbackData;
  }
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryListParams {
  outletId: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export async function fetchInventoryItems(
  params: InventoryListParams,
): Promise<InventoryItem[]> {
  const { outletId, page = 1, limit = 100, search, category, lowStock } = params;

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search    ? { search }              : {}),
    ...(category  ? { category }            : {}),
    ...(lowStock  ? { lowStock: "true" }    : {}),
  });

  const result = await apiRequest<InventoryListResult>(
    `/inventory/items?${qs.toString()}`,
    { outletId },
  );
  if (result.ok) return result.data.items;

  console.warn("fetchInventoryItems failed:", result.error, "— using mock data");
  return [...FALLBACK_INVENTORY];
}

export async function createInventoryItem(
  outletId: string,
  itemData: Omit<InventoryItem, "id" | "currentStock" | "createdAt">,
): Promise<{ ok: boolean; item?: InventoryItem; error?: string }> {
  const result = await apiRequest<InventoryItem>("/inventory/items", {
    method: "POST",
    body: itemData,
    outletId,
  });
  if (result.ok) return { ok: true, item: result.data };
  return { ok: false, error: result.error };
}

export async function adjustInventoryStock(
  outletId: string,
  itemId: string,
  change: number,
  reason: "SALE" | "WASTE" | "PURCHASE" | "ADJUSTMENT",
  idempotencyKey?: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await apiRequest(`/inventory/items/${itemId}/adjust`, {
    method: "POST",
    body: { change, reason, idempotencyKey },
    outletId,
  });
  if (result.ok) return { ok: true };
  return { ok: false, error: result.error };
}
