import { 
    ParentVerifyChallenge, 
    ParentVerifyRequest, 
    ParentVerifyResponse, 
    ParentPortal 
} from "@/lib/api/api-types";


export const parentApi = {
  getChallenge: (linkToken: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parent/${linkToken}/verify`, {
      method: "GET",
    }).then(async (res) => {
      if (!res.ok) throw { status: res.status };
      return res.json() as Promise<ParentVerifyChallenge>;
    }),

  postVerify: (linkToken: string, body: ParentVerifyRequest) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parent/${linkToken}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) throw { status: res.status };
      return res.json() as Promise<ParentVerifyResponse>;
    }),

  getPortal: (
    linkToken: string,
    filters: { term: number[] | null; level: string[] | null }
  ) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parent/${linkToken}/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: filters.term, level: filters.level }),
    }).then(async (res) => {
      if (!res.ok) throw { status: res.status };
      return res.json() as Promise<ParentPortal>;
    }),
};