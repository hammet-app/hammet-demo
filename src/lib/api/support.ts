import { apiClient } from "@/lib/api/api-client";
import { CallbackForm } from "@/lib/api/types/support/types";

export async function sendCallback(
    body: CallbackForm
): Promise<boolean> {
    return apiClient.post("/callback", body)
}