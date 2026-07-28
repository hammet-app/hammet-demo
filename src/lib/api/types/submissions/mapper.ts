import {
    UploadRequestDto,
    CreateSubmissionRequestDto, 
    CreateSubmissionResponseDto,
    SyncSubmissionItemDto,
    SyncSubmissionResultDto,
    SyncSubmissionsRequestDto,
    SyncSubmissionsResponseDto,
    AiFormStateDto,
    ResubmissionDto,
    CreateSubmissionResponsesDto
} from "@/lib/api/types/submissions/types-dto";
import {
    UploadRequest,
    CreateSubmissionRequest, 
    CreateSubmissionResponse,
    SyncSubmissionItem,
    SyncSubmissionResult,
    SyncSubmissionsRequest,
    SyncSubmissionsResponse,
    AiFormState,
    Resubmission,
    CreateSubmissionResponses
} from "@/lib/api/types/submissions/types";
import { fromPreviewLink, toPreviewLink } from "../student";

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

export function fromUploadRequest(model: UploadRequest): UploadRequestDto {
    return {
        name: model.name,
        type: model.type,
        module_id: model.moduleId
    }
}

export function fromAiFormState(model: AiFormState): AiFormStateDto {
    return {
        used: model.used,
        no_reason: model.noReason,
        no_reason_other: model.noReasonOther,
        tool_used: model.toolOther,
        tool_other: model.toolOther,
        task_desc: model.taskDesc,
        prompt_choice: model.promptChoice,
        edited_prompt: model.editedPrompt,
        rating: model.rating,
        rating_comment: model.ratingComment
    }
}

export function toAiFormState(dto: AiFormStateDto): AiFormState {
    return {
        used: dto.used,
        noReason: dto.no_reason,
        noReasonOther: dto.no_reason_other,
        toolUsed: dto.tool_used,
        toolOther: dto.tool_other,
        taskDesc: dto.task_desc,
        promptChoice: dto.prompt_choice,
        editedPrompt: dto.edited_prompt,
        rating: dto.rating,
        ratingComment: dto.rating_comment
    }
}


export function fromCreateSubmissionRequest(model: CreateSubmissionRequest): CreateSubmissionRequestDto {
    return {
        module_id: model.moduleId,
        activity_text: model.activityText,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls?.map(fromPreviewLink) ?? null,
        other_urls: model.otherUrls?.map(fromPreviewLink) ?? null,
        ai_form: model.aiForm 
            ? fromAiFormState(model.aiForm)
            : null,
        local_id: model.localId
    }
}

export function toCreateSubmissionResponse(dto: CreateSubmissionResponseDto): CreateSubmissionResponse {
    return {
        id: dto.id,
        studentId: dto.student_id,
        moduleId: dto.module_id,
        status: dto.status,
        activityText: dto.activity_text,
        reflectionText: dto.reflection_text,
        aiForm: dto.ai_form
                ? toAiFormState(dto.ai_form)
                : null,
        fileUrls: dto.file_urls?.map(toPreviewLink) ?? null,
        otherUrls: dto.other_urls?.map(toPreviewLink) ?? null,
        teacherNote: dto.teacher_note,
        approvedAt: dto.approved_at,
        approvedBy: dto.approved_by,
        submittedAt: dto.submitted_at,
        syncedAt: dto.synced_at,
        localId: dto.local_id
    }
}

export function fromResubmission(model: Resubmission): ResubmissionDto {
    return {
        id: model.id,
        activity_text: model.activityText,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls?.map(fromPreviewLink) ?? null,
        other_urls: model.otherUrls?.map(fromPreviewLink) ?? null,
        ai_form: model.aiForm ? fromAiFormState(model.aiForm) : null,
        local_id: model.localId
    }
}

export function toCreateSubmissionResponses(dto: CreateSubmissionResponsesDto): CreateSubmissionResponses {
    return {
        submissions: dto.submissions.map(toCreateSubmissionResponse)
    }
}

export function fromSyncSubmissionItem(model: SyncSubmissionItem): SyncSubmissionItemDto {
    return {
        module_id: model.moduleId,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls,
        other_urls: model.otherUrls,
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