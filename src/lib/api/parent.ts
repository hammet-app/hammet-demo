import { 
    type ParentVerifyChallenge, 
    type ParentVerifyRequest, 
    type ParentVerifyResponse, 
    type ParentPortalRequest,
    type ParentPortal, 
    type ParentVerifyChallengeDto,
    type ParentPortalDto,    
    ParentVerifyResponseDto,
    toParentVerifyResponse,
    toParentVerifyChallenge,
    toParentPortal
} from "@/lib/api/types";
import { apiClient } from "@/lib/api/api-client";


export const parentApi = {
  getChallenge: async (linkToken: string): Promise<ParentVerifyChallenge> =>{
    const response = await apiClient.get<ParentVerifyChallengeDto>(`/parent/${encodeURIComponent(linkToken)}/verify`)
    return toParentVerifyChallenge(response)
  },

  postVerify: async (linkToken: string, body: ParentVerifyRequest): Promise<ParentVerifyResponse> =>{
    const response = await apiClient.post<ParentVerifyResponseDto>(`/parent/${encodeURIComponent(linkToken)}/verify`, body)
    return toParentVerifyResponse(response)
  },
  getPortal: async(
    linkToken: string,
    filters: ParentPortalRequest
  ): Promise<ParentPortal> =>{
    const response = await apiClient.post<ParentPortalDto>(`/parent/${encodeURIComponent(linkToken)}/portal`, filters)
    return toParentPortal(response)
  }
};