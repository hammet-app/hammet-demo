export interface LoginResponse {
    access_token: string
    token_type: string
}

export type UserRole = "hammet_admin" | "tutor" | "student" | "school_admin"

export interface JwtPayload {
    user_id: string
    role: UserRole
    exp: number
}