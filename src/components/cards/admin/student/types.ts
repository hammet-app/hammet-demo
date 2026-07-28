export type RowAction =
  | { type: "send-link"; studentId: string }
  | { type: "revoke-link"; studentId: string }
  | { type: "delete"; studentId: string }
  | { type: "resend-code"; studentId: string }
  | { type: "update"; studentId: string };

export type InFlight = { studentId: string; action: RowAction["type"] };
