import { CallbackForm } from "@/lib/api/types/support/types";
import { CallbackFormDto } from "@/lib/api/types/support/types-dto";


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