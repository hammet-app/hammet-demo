import { 
    ParentVerifyChallenge, 
    ParentVerifyRequest, 
    ParentVerifyResponse, 
    ParentPortalRequest,
    ParentPortal 
} from "@/lib/api/api-types";
import { apiClient } from "@/lib/api/api-client";


export const parentApi = {
  getChallenge: (linkToken: string) =>
    apiClient.get<ParentVerifyChallenge>("/parent/{token}/verify"),

  postVerify: (linkToken: string, body: ParentVerifyRequest) =>
    apiClient.post<ParentVerifyResponse>("/parent/{token}/verify"),

  getPortal: (
    linkToken: string,
    filters: ParentPortalRequest
  ) =>
    apiClient.post<ParentPortal>("/parent/{token}/portal", filters)
};