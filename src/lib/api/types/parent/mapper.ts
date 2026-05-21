import { 
    ParentPortalDto,
    ParentVerifyChallengeDto, 
    ParentVerifyResponseDto
} from "@/lib/api/types/parent/types-dto";
import { 
    ParentPortal,
    ParentVerifyChallenge,
    ParentVerifyResponse
} from "@/lib/api/types/parent/types";
import { toTermProgress } from "@/lib/api/types/student/mapper";

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

export function toParentVerifyChallenge(dto: ParentVerifyChallengeDto): ParentVerifyChallenge {
    return {
        studentName: dto.student_name,
        question: dto.question
    }
}

export function toParentVerifyResponse(dto: ParentVerifyResponseDto): ParentVerifyResponse {
    return {
        availableLevels: dto.available_levels,
        currentLevel: dto.current_level,
        currentTerm: dto.current_term
    }
}

export function toParentPortal(dto: ParentPortalDto): ParentPortal {
    return {
        studentName: dto.student_name,
        classLevel: dto.class_level,
        classArm: dto.class_arm,
        schoolName: dto.school_name,
        termProgress: dto.term_progress
                        ? toTermProgress(dto.term_progress)
                        : null,
        portfolioEntry: dto.portfolio_entry,
        performance: dto.performance
    }
}