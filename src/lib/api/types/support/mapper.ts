import { CallbackForm, Pagination } from "@/lib/api/types/support/types";
import { CallbackFormDto, PaginationDto } from "@/lib/api/types/support/types-dto";


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
export function fromCallbackForm(model: CallbackForm): CallbackFormDto {
    return {
        school_name: model.schoolName,
        full_name: model.fullName,
        email: model.email,
        role: model.role,
        phone: model.phone,
        city: model.city
    }
}

export function toPagination(model: PaginationDto): Pagination {
    return {
        page: model.page,
        pageSize: model.page_size,
        total: model.total,
        totalPages: model.total_pages
    }
}