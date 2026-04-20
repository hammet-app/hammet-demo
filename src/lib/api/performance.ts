import { apiClient } from "@/lib/api/api-client";

export interface PerformancePoint {
  term: number;
  level: string;
  label: number;      // week_number
  y: number;          // moving average 0–1
  band: "Needs Work" | "Improving" | "Strong";
}

export interface PerformanceParams {
  term?: number[];
  level?: string[];
}

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
