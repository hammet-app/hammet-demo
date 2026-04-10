import { getToken } from "@/utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiOptions extends RequestInit {}

export const apiRequest = async (
    endpoint: string,
    options: ApiOptions = {}
) => {
    const token = getToken()

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (response.status === 401) {
        localStorage.removeItem("jamb_ai_token")
        window.location.href = "/login"
    }

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || "Something went wrong")
    }

    return data
}