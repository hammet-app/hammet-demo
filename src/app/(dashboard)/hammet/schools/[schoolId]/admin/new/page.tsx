"use client"

import { useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context"; 
import { PageShell } from "@/components/layout/common/PageShell";
import { FormSection } from "@/components/forms/FormSection";
import { AuthInput } from "@/components/ui";
import { Alert, Button } from "@/components/ui";
import { registerAdmin } from "@/lib/api/hammet";
import { RegisterAdminRequest } from "@/lib/api/types";
import { ApiError } from "@/lib/api/api-client";

export default function HammetRegisterAdmin() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const schoolId = params.schoolId as string;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    form: "",
  });

  const [isLoading, setIsLoading] = useState(false)

  function setField(
    key: "fullName" | "email",
    value: string
  ) {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  }

  function validate() {
    const errors = {
      fullName: "",
      email: "",
      form: "",    
    };

    if (!form.fullName.trim())
      errors.fullName = "Full name is required";

    if (!form.email.trim())
      errors.email = "Email is required";

    if (!/\S+@\S+\.\S+/.test(form.email))
        errors.email = "Enter a valid email.";

    return errors;
    
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    if (!accessToken) return;
    e.preventDefault();

    setErrors({
      fullName: "",
      email: "",
      form: "",
    })

    const validation = validate();

    if (
      validation.fullName || validation.email
    ) {
      setErrors(validation)
      return;
    }

    setIsLoading(true);

    try {
      await registerAdmin(
        {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          schoolId: schoolId,
          roles: ["school_admin"]
        } satisfies RegisterAdminRequest,
        accessToken,
        refreshToken
      )
      router.push(`/hammet/schools/${schoolId}`)
    }catch (err) {
      if ( err instanceof ApiError) {
        setErrors(prev => ({
          ...prev,
          form:
          err?.message ??
          "Failed to create administrator"
        }))
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      title="Add School Administrator"
      description="Create another administrator for this school."
      backHref={`/hammet/schools/${schoolId}`}
    >
      < div className="mx-auto w-full max-w-2xl"> 
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {errors.form && (
            <Alert title="Failed Registration">
              {errors.form}
            </Alert>
          )}
          <FormSection
            title="Administrator Details"
            description="This user will be able to manage students and settings for this school."
          >
            <AuthInput
              id="full-name"
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setField("fullName", e)}
              error={errors.fullName}        
            />

            <AuthInput
              id="email"
              label="Email Address"
              value={form.email}
              onChange={(e) => setField("email", e)}
              error={errors.email}
            />
          </FormSection>

          <div className="border-t border-border pt-6 flex justify-end">
            <Button
              className="h-10 w-fit mx-auto rounded-xl px-5 bg-purple text-white flex items-center justify-center gap-2 text-md cursor-pointer" 
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                "Create Administrator"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  )
}