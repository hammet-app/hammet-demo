import { LoginResponse } from "@/types/auth";
import { apiRequest } from "./api";

export const loginUser = async (
    email: string,
    password: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            }
        )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Login failed")
    }

    return response.json()
}

export const registerTutor = async(
    email: string,
    password: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/tutor`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        }
    )

    if (!response.ok) {
        const error = await response.json()
        console.log("Error,",error)
        throw new Error(`Registration failed: ${error.message}` || "Unknown error")
    }
    return response.json()
}

export const registerStudent = async (
    email: string,
    password: string, 
    inviteToken: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/student`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                invite_token: inviteToken
            }),
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Registration failed: ${error.message}` || "Unknown error")
    }

    return response.json()
}
