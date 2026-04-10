const DEVICE_ID_KEY = "hammet_device_id";

/**
 * Returns a stable device ID for the current browser.
 * Generated once and persisted in localStorage.
 * Not sensitive — used only to scope refresh tokens on the backend.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
