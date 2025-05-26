import { create } from "zustand";
import { DashboardData } from "@/types/dashboard";
import { fetchDashboardData } from "@/services/dashboardService";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  timeRange: string;
  cached: boolean;
  fetchData: () => Promise<void>;
  setTimeRange: (range: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,
  timeRange: "7d",
  cached: false,
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const { data, cached } = await fetchDashboardData();
      set({ data, cached, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  setTimeRange: (range) => set({ timeRange: range }),
}));
