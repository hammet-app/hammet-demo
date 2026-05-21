type UserRole = "hammet_admin" | "student" | "school_admin"

export interface JwtPayload {
    user_id: string
    role: UserRole
    exp: number
}