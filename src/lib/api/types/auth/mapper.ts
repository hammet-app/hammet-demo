import {
    BulkRegisterResponseDto,
    ClaimAccountRequestDto,
    ClaimAccountResponseDto,
    forgotPasswordResponseDto,
    InviteInfoDto,
    LoginResponseDto,
    RefreshResponseDto,
    RegisterSchoolRequestDto,
    RegisterSchoolResponseDto,
    RegisterStudentRequestDto,
    RegisterStudentResponseDto
} from "@/lib/api/types/auth/types-dto";
import {
    BulkRegisterResponse,
    ClaimAccountRequest,
    ClaimAccountResponse,
    InviteInfo,
    LoginResponse,
    RefreshResponse,
    RegisterSchoolRequest,
    RegisterSchoolResponse,
    RegisterStudentRequest,
    RegisterStudentResponse
} from "@/lib/api/types/auth/types";

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

type UserDto = LoginResponseDto["user"]
type User = LoginResponse["user"]

function toUser(dto: UserDto): User {
    return {
        id: dto.id,
        fullName: dto.full_name,
        email: dto.email,
        roles: dto.roles,
        schoolId: dto.school_id,
        cookieConsent: dto.cookie_consent,
        cookiePolicyVersion: dto.cookie_policy_version,
        classLevel: dto.class_level,
        classArm: dto.class_arm,
        term: dto.term
    }
}

export function toInviteInfo(dto: InviteInfoDto): InviteInfo {
    return {
        fullName: dto.full_name,
        email: dto.email,
        roles: dto.roles
    }
}

export function toLoginResponse(dto: LoginResponseDto): LoginResponse {
    return {
        accessToken: dto.access_token,
        user: toUser(dto.user)
    }
}

export function fromClaimAccountRequest(model: ClaimAccountRequest): ClaimAccountRequestDto {
    if ("googleIdToken" in model) {
        return {
            token: model.token,
            google_id_token: model.googleIdToken,
            device_id: model.deviceId
        }
    }
    return {
        email: model.email,
        token: model.token,
        claim_code: model.claimCode,
        password: model.password,
        device_id: model.deviceId

    }
}

export function toClaimAccountResponse(dto: ClaimAccountResponseDto): ClaimAccountResponse {
    return {
        accessToken: dto.access_token,
        user: toUser(dto.user)
    }
}

export function toRefreshResponse(dto: RefreshResponseDto): RefreshResponse {
    return {
        accessToken: dto.access_token,
        user: toUser(dto.user)
    }
}

export function fromRegisterSchoolRequest(model: RegisterSchoolRequest): RegisterSchoolRequestDto {
    return {
        name: model.name,
        tier: model.tier,
        school_email: model.schoolEmail,
        phone_number: model.phoneNumber,
        school_address: model.schoolAddress,
        school_website: model.schoolWebsite,
        admin_full_name: model.adminFullName,
        admin_email: model.adminEmail,
        arms: model.arms,
        roles: model.roles
    }
}

export function toRegisterSchoolResponse(dto: RegisterSchoolResponseDto): RegisterSchoolResponse {
    return {
        schoolId: dto.school_id,
        adminId: dto.admin_id,
        message: dto.message
    }
}

export function fromRegisterStudentRequest(model: RegisterStudentRequest): RegisterStudentRequestDto {
    return {
        full_name: model.fullName,
        email: model.email,
        class_level: model.classLevel,
        class_arm: model.classArm,
        parent_email: model.parentEmail,
        parent_phone: model.parentPhone,
        date_of_birth: model.dateOfBirth
    }
}

export function toRegisterStudentResponse(dto: RegisterStudentResponseDto): RegisterStudentResponse {
    return {
        fullName: dto.full_name,
        email: dto.email,
        code: dto.code
    }
}

export function toBulkRegisterResponse(dto: BulkRegisterResponseDto): BulkRegisterResponse {
    return {
        total: dto.total,
        codes: dto.codes.map(toRegisterStudentResponse)
    }
}
export function toForgotPasswordResponse(dto: forgotPasswordResponseDto) {
    return {
        isAdmin: dto.is_admin
    }
}