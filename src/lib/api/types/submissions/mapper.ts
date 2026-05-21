import { 
    CreateSubmissionRequestDto, 
    CreateSubmissionResponseDto,
    SyncSubmissionItemDto,
    SyncSubmissionResultDto,
    SyncSubmissionsRequestDto,
    SyncSubmissionsResponseDto
} from "@/lib/api/types/submissions/types-dto";
import { 
    CreateSubmissionRequest, 
    CreateSubmissionResponse,
    SyncSubmissionItem,
    SyncSubmissionResult,
    SyncSubmissionsRequest,
    SyncSubmissionsResponse
} from "@/lib/api/types/submissions/types";

/**
 * Naming convention:
 *
 * fromXxx(...)
 * Converts frontend/domain models into backend DTOs
 * (camelCase -> snake_case, app shape -> API shape)
 *
 * toXxx(...)
 * Converts backend DTOs into frontend/domain models
 * (snake_case -> camelCase, API shape -> app shape)
 */


export function fromCreateSubmissionRequest(model: CreateSubmissionRequest): CreateSubmissionRequestDto {
    return {
        module_id: model.moduleId,
        activity_text: model.activityText,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls,
        local_id: model.localId
    }
}

export function toCreateSubmissionResponse(dto: CreateSubmissionResponseDto): CreateSubmissionResponse {
    return {
        id: dto.id,
        moduleId: dto.module_id,
        status: dto.status,
        submittedAt: dto.submitted_at,
        syncedAt: dto.synced_at,
        localId: dto.local_id
    }
}

export function fromSyncSubmissionItem(model: SyncSubmissionItem): SyncSubmissionItemDto {
    return {
        module_id: model.moduleId,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls,
        local_id: model.localId
    }
}

export function fromSyncSubmissionRequest(model: SyncSubmissionsRequest): SyncSubmissionsRequestDto {
    return {
        submissions: model.submissions.map(fromSyncSubmissionItem)
    }
}

export function toSyncSubmissionResult(dto: SyncSubmissionResultDto): SyncSubmissionResult {
    return {
        localId: dto.local_id,
        id: dto.id,
        status: dto.status,
        submittedAt: dto.submitted_at
    }
}

export function toSyncSubmissionResponse(dto: SyncSubmissionsResponseDto): SyncSubmissionsResponse {
    return {
        results: dto.results.map(toSyncSubmissionResult)
    }
}