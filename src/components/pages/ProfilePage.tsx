"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Compass,
  Focus,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui";
import type { AuthUser } from "@/lib/utils/roles";

type LearningMode = "guided" | "focus";

type ProfilePageProps = {
  user: AuthUser;

  onLearningModeChange?: (mode: LearningMode) => Promise<void> | void;
  onUsernameChange?: (username: string) => Promise<void> | void;
  onPasswordChange?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void> | void;
};

export function ProfilePage({
  user,
  onLearningModeChange,
  onUsernameChange,
  onPasswordChange,
}: ProfilePageProps) {
  const isStudent = user.roles.includes("student");

  const [learningMode, setLearningMode] = useState<LearningMode>(
    user.learningMode ?? "guided"
  );

  const [username, setUsername] = useState(user.username ?? "");
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [learningModeSaving, setLearningModeSaving] = useState(false);

  async function handleLearningModeChange(mode: LearningMode) {
    if (mode === learningMode) return;
    
    setLearningMode(mode);
    setLearningModeSaving(true);

    try {
      await onLearningModeChange?.(mode);
    } catch {
      setLearningMode(user.learningMode ?? "guided");
    } finally {
      setLearningModeSaving(false);
    }
  }

  async function handleUsernameSave() {
    const nextUsername = username.trim();

    if (!nextUsername) return;

    setUsernameSaving(true);
    setUsernameMessage("");

    try {
      await onUsernameChange?.(nextUsername);
      setUsername(nextUsername);
      setUsernameEditing(false);
      setUsernameMessage("Username updated.");
    } catch {
      setUsernameMessage("Unable to update username.");
    } finally {
      setUsernameSaving(false);
    }
  }

  async function handlePasswordSave() {
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);

    try {
      await onPasswordChange?.(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch {
      setPasswordError("Unable to update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <section className="rounded-3xl border border-border bg-bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple">
              <User className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {user.fullName}
              </h1>

              <p className="mt-1 truncate text-sm text-text-secondary">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Learning Experience — students only */}
        {isStudent && (
          <section className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-text-primary">
                Learning experience
              </h2>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Choose how you want Hammet to guide you through your lessons.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <LearningModeOption
                selected={learningMode === "guided"}
                disabled={learningModeSaving}
                icon={<Compass className="h-5 w-5" />}
                title="Guided"
                description="Get helpful guidance and coaching as you work through lessons."
                onClick={() => handleLearningModeChange("guided")}
              />

              <LearningModeOption
                selected={learningMode === "focus"}
                disabled={learningModeSaving}
                icon={<Focus className="h-5 w-5" />}
                title="Focus"
                description="Work through lessons independently with fewer interruptions."
                onClick={() => handleLearningModeChange("focus")}
              />
            </div>
          </section>
        )}

        {/* Account */}
        <section className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Account
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Manage the details you use to access your account.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Username
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!usernameEditing || usernameSaving}
                  className={cn(
                    "h-11 flex-1 rounded-xl border border-border bg-bg-page px-3.5",
                    "text-sm text-text-primary outline-none transition-colors",
                    usernameEditing &&
                      "focus:border-purple focus:ring-2 focus:ring-purple/10",
                    !usernameEditing && "cursor-default"
                  )}
                />

                {!usernameEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUsernameMessage("");
                      setUsernameEditing(true);
                    }}
                    className="h-11"
                  >
                    Change
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={usernameSaving}
                      onClick={() => {
                        setUsername(user.username ?? "");
                        setUsernameEditing(false);
                        setUsernameMessage("");
                      }}
                      className="h-11"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      disabled={
                        usernameSaving ||
                        !username.trim() ||
                        username.trim() === user.username
                      }
                      onClick={handleUsernameSave}
                      className="h-11"
                    >
                      {usernameSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>

              {usernameMessage && (
                <p className="mt-2 text-xs text-text-secondary">
                  {usernameMessage}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Email
              </label>

              <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-bg-page px-3.5">
                <Mail className="h-4 w-4 shrink-0 text-text-muted" />

                <span className="truncate text-sm text-text-secondary">
                  {user.email}
                </span>
              </div>

              {/* Email change will be enabled later for admins. */}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Security
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <PasswordField
              label="Current password"
              value={currentPassword}
              visible={showCurrentPassword}
              onChange={setCurrentPassword}
              onToggle={() =>
                setShowCurrentPassword((visible) => !visible)
              }
            />

            <PasswordField
              label="New password"
              value={newPassword}
              visible={showNewPassword}
              onChange={setNewPassword}
              onToggle={() => setShowNewPassword((visible) => !visible)}
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              visible={showConfirmPassword}
              onChange={setConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((visible) => !visible)
              }
            />

            {passwordError && (
              <p className="text-sm text-red-600">
                {passwordError}
              </p>
            )}

            {passwordMessage && (
              <p className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                {passwordMessage}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                disabled={
                  passwordSaving ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                onClick={handlePasswordSave}
              >
                {passwordSaving ? "Updating..." : "Update password"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LearningModeOption({
  selected,
  disabled,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-purple bg-purple/5 ring-2 ring-purple/10"
          : "border-border bg-bg-page hover:border-purple/40",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      <div className="mb-3 flex w-full items-center justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            selected ? "bg-purple text-white" : "bg-purple/10 text-purple"
          )}
        >
          {icon}
        </div>

        {selected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple text-white">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>

      <p className="font-semibold text-text-primary">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </button>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-bg-page pl-10 pr-11 text-sm text-text-primary outline-none transition-colors focus:border-purple focus:ring-2 focus:ring-purple/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}