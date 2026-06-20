import {
    AdminModulesResponseDto,
    AdminStudentDto,
    AdminStudentsResponseDto,
    ParentLinkSendResponseDto,
    SchoolProfileDto,
    SchoolStatsDto,
    UpdateTermDto,
    UserUpdateRequestDto
} from "@/lib/api/types/admin/types-dto"
import {
    UserStatus,
    AdminStudent,
    SchoolProfile,
    SchoolStats,
    AdminModulesResponse,
    AdminStudentsResponse,
    UserUpdateRequest,
    ParentLinkSendResponse,
    UpdateTerm
} from "@/lib/api/types/admin/types"
import {toCurriculumModule} from "@/lib/api/types/module"

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

export function toSchoolStats(dto: SchoolStatsDto): SchoolStats {
    return {
        totalStudents: dto.total_students,
        activeStudents: dto.active_students,
        pendingStudents: dto.pending_students
    }
}

export function toSchoolProfile(dto: SchoolProfileDto): SchoolProfile {
    return {
        id: dto.id,
        name: dto.name,
        tier: dto.tier,
        term: dto.term,
        availableArms: dto.available_arms,
        stats: toSchoolStats(dto.stats),
        termStart: dto.term_start,
        termEnd: dto.term_end,
        session: dto.session
    }
}

export function fromUpdateTermRequest(model: UpdateTerm): UpdateTermDto {
    return {
        term_start: model.termStart,
        term_end: model.termEnd,
        session: model.session
    }
}

export function toAdminStudent(dto: AdminStudentDto): AdminStudent {
    return {
        studentId: dto.student_id,
        fullName: dto.full_name,
        email: dto.email,
        classLevel: dto.class_level,
        classArm: dto.class_arm,
        status: dto.status,
        createdAt: dto.created_at,
        parentLinkSentAt: dto.parent_link_sent_at
    }
}

export function toAdminStudentResponse(dto: AdminStudentsResponseDto): AdminStudentsResponse {
    return {
        students: dto.students.map(toAdminStudent),
        total: dto.total
    }
}

export function fromUpdateUserRequest(model: UserUpdateRequest): UserUpdateRequestDto {
    return {
        email: model.email,
        date_of_birth: model.dateOfBirth,
        class_level: model.classLevel,
        class_arm: model.classArm,
        parent_phone: model.parentPhone,
        parent_email: model.parentEmail
    }
}

export function toParentLinkSendResponse(dto: ParentLinkSendResponseDto): ParentLinkSendResponse {
    return {
        studentId: dto.student_id,
        parentEmail: dto.parent_email,
        parentPhone: dto.parent_phone,
        expiresAt: dto.expires_at
    }
}

export function toAdminModulesResponse(dto: AdminModulesResponseDto): AdminModulesResponse {
    return {
        modules: dto.modules.map(toCurriculumModule),
        total: dto.total
    }
}