import { apiClient } from "./api-client";
import { CallbackForm } from "./api-types";

export async function sendCallback(
    body: CallbackForm
): Promise<boolean> {
    return apiClient.post("/callback", body)
}