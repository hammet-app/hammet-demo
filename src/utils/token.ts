import { JwtPayload } from "@/types/auth"
import { jwtDecode } from "jwt-decode"

const TOKEN_KEY = "hammet_ai_token"

export const saveToken = (token: string) => {
    document.cookie = `${TOKEN_KEY}=${token}; path=/`
}

export const getToken = (): string | null => {
  const match = document.cookie.match(
    new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)")
  )
  return match ? match[2] : null
}

export const removeToken = () => {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwtDecode<JwtPayload>(token)
    } catch {
        return null
    }
}