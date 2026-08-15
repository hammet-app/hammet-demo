"use client"

import { ProfilePage } from "@/components/pages/ProfilePage";
import { Alert } from "@/components/ui";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { studentApi } from "@/lib/api/student";
import { UpdatePasswordDto } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { isFeatureEnabled } from "@/lib/features/flags";
import { useState } from "react";

export default function Page() {
  const { user, accessToken, refreshToken, updateUser } = useAuth();

  const [error, setError] = useState<string |null>(null)

  if (!user) return;

  const lessonCoachEnabled = isFeatureEnabled(
      "lesson_coach",
      user.schoolId
    );

  async function saveLearningMode(mode: "focus" | "guided") {
    if (!user || !accessToken) return;

    try {
      await studentApi.saveLearningMode(
        mode,
        accessToken,
        refreshToken
      )

      updateUser({ learningMode: mode })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Error saving mode")
      }

      throw err;
    }
  }

  async function updateUsername(username: string) {
    if (!user || !accessToken) return;

    try {
      await apiClient.patch<boolean>(
        "/auth/update",
        {username: username},
        accessToken,
        {onRefresh: refreshToken}
      )

      updateUser({ username})
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Username could not be changed. Please try again later")
      }

      throw err;
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    if (!user || !accessToken) return;

    try {
      await apiClient.patch<boolean>(
        "/auth/update-password",
        ({ current_password: currentPassword, new_password: newPassword}) satisfies UpdatePasswordDto,
        accessToken,
        {onRefresh: refreshToken}
      )

    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Unable to update password. Please try again")
      }
      throw err;
    }
  }

  return (
    <>
      {error && (
        <Alert title="Error Updating Value" variant="error">
          {error}
        </Alert>
      )}
      {lessonCoachEnabled && (
        <ProfilePage 
          user={user} 
          onLearningModeChange={saveLearningMode}
          onUsernameChange={updateUsername}
          onPasswordChange={updatePassword}
        />
      )}
    </>
  )
}