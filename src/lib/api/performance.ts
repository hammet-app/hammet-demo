import { apiClient } from "@/lib/api/api-client";

export interface PerformancePoint {
  term: number;
  level: string;
  label: number;      // week_number
  y: number;          // moving average 0–1
  band: "Needs Work" | "Improving" | "Strong";
}

export interface PerformanceParams {
  term?: number | number[];
  level?: string | string[];
}

export const performanceApi = {
  getPerformance: (
    params: PerformanceParams,
    token: string,
    onRefresh: () => Promise<string | null>
  ) => {
    const query = new URLSearchParams();

    if (params.term !== undefined) {
      const terms = Array.isArray(params.term) ? params.term : [params.term];
      terms.forEach((t) => query.append("term", String(t)));
    }

    if (params.level !== undefined) {
      const levels = Array.isArray(params.level) ? params.level : [params.level];
      levels.forEach((l) => query.append("level", l));
    }

    return apiClient.get<PerformancePoint[]>(
      `/students/me/performance?${query.toString()}`,
      token,
      { onRefresh }
    );
  },
};
