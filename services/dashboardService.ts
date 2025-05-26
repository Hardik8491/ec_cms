import { DashboardData } from "@/types/dashboard";


export const fetchDashboardData = async (
  range: string = "7d"
): Promise<{
  data: DashboardData;
  cached: boolean;
}> => {
  const response = await fetch(`/api/agency/dashboard?range=${range}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return await response.json();
};
