import { 
    AdminDetails,
    DeactivateSchoolResponse,
    Dispute,
    DisputeReviewPayload,
    Disputes,
    SchoolDetails,
    SchoolDetailsItem,
    SchoolListItem, 
    SchoolsListResponse
} from "@/lib/api/types/hammet/types";
import { 
    AdminDetailsDto,
    DeactivateSchoolResponseDto,
    DisputeDto,
    DisputeReviewPayloadDto,
    DisputesDto,
    SchoolDetailsDto,
    SchoolDetailsItemDto,
    SchoolListItemDto,
    SchoolsListResponseDto
} from "@/lib/api/types/hammet/types-dto";

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

function toSchoolDetails(dto: SchoolDetailsDto): SchoolDetails {
    return {
        id: dto.id,
        name: dto.name,
        tier: dto.tier,
        email: dto.email,
        address: dto.address,
        phoneNumber: dto.phone_number,
        website: dto.website,
        term: dto.term,
        createdAt: dto.created_at,
        stats: {
            totalStudents: dto.stats.total_students,
            activeStudents: dto.stats.active_students,
            pendingStudents: dto.stats.pending_students,
        }
    }

}

function toAdminDetails(dto: AdminDetailsDto): AdminDetails {
    return {
        id: dto.id,
        fullName: dto.full_name,
        email: dto.email,
        role: dto.role,
        lastLogin: dto.last_login
    }
}


export function toSchoolListItem(dto: SchoolListItemDto): SchoolListItem {
    return {
        id: dto.id,
        name: dto.name,
        tier: dto.tier,
        term: dto.term,
        stats: {
            totalStudents: dto.stats.total_students,
            activeStudents: dto.stats.active_students,
            pendingStudents: dto.stats.pending_students
        },
        createdAt: dto.created_at
    }
}

export function toSchoolListResponse(dto: SchoolsListResponseDto): SchoolsListResponse {
    return {
        schools: dto.schools.map(toSchoolListItem),
        total: dto.total
    }
}

export function toSchoolDetailsItem(dto: SchoolDetailsItemDto): SchoolDetailsItem {
    return {
        school: toSchoolDetails(dto.school),
        admins: dto.admins.map(toAdminDetails)
    }
}
 
export function toDeactivateSchoolResponse(dto: DeactivateSchoolResponseDto): DeactivateSchoolResponse {
    return {
        schoolId: dto.school_id,
        tier: dto.tier,
        message: dto.message
    }
}


export function fromDisputeReviewPayload(model: DisputeReviewPayload): DisputeReviewPayloadDto {
    return {
        id: model.id,
        review_note: model.reviewNote
    }
}

export function toDispute(dto: DisputeDto): Dispute {
    return {
        id: dto.id,
        studentId: dto.student_id,
        moduleTitle: dto.module_title,
        originalResponse: dto.original_response,
        aiStatus: dto.ai_status,
        aiScore: dto.ai_score,
        studentReview: dto.student_review,
        studentDisputeNote: dto.student_dispute_note,
        disputedAt: dto.disputed_at,
        reviewedBy: dto.reviewed_by,
        reviewed: dto.reviewed,
        reviewNote: dto.review_note
    }
}

export function toDisputes(dto: DisputesDto): Disputes {
    return {
        disputes: dto.disputes.map(toDispute)
    }
}
