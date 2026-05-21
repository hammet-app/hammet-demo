import { apiClient } from "@/lib/api/api-client";
import { PerformancePoint, PerformanceParams } from "./types";

export const performanceApi = {
  getPerformance: (
    params: PerformanceParams,
    token: string,
    onRefresh: () => Promise<string | null>
  ) => {
    const query = new URLSearchParams();

    params.term?.forEach((t) => query.append("term", String(t)));
    params.level?.forEach((l) => query.append("level", l));

    const qs = query.toString();
    return apiClient.get<PerformancePoint[]>(
      `/students/me/performance${qs ? `?${qs}` : ""}`,
      token,
      { onRefresh }
    );
  },
};