import { 
    DeactivateSchoolResponse,
    SchoolListItem, 
    SchoolsListResponse
} from "@/lib/api/types/hammet/types";
import { 
    DeactivateSchoolResponseDto,
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

export function toDeactivateSchoolResponse(dto: DeactivateSchoolResponseDto): DeactivateSchoolResponse {
    return {
        schoolId: dto.school_id,
        tier: dto.tier,
        message: dto.message
    }
}