import {
    PublicPortfolio
} from "@/lib/api/types/public/types"
import {
    PublicPortfolioDto
} from "@/lib/api/types/public/types-dto"
import { toPortfolioEntry } from "@/lib/api/types/student"

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

export function toPublicPortfolio(dto: PublicPortfolioDto): PublicPortfolio {
    return {
        studentName: dto.school_name,
        schoolName: dto.school_name,
        classLevel: dto.class_level,
        entries: dto.entries.map(toPortfolioEntry),
        total: dto.total
    }
}