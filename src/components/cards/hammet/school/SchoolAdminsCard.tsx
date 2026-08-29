import { AdminDetails } from "@/lib/api/types";
import { Button } from "@/components/ui";
import { RefreshCw, ShieldCheck } from "lucide-react";

type SchoolAdminsCardProps = {
  admins: AdminDetails[];
  onAddAdmin?: () => void;
  onRegenerateCode?: (admin: AdminDetails) => void;
};

export function SchoolAdminsCard({
  admins,
  onAddAdmin,
  onRegenerateCode,
}: SchoolAdminsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Administrators ({admins.length})
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Users who have administrative access.
          </p>
        </div>

        {onAddAdmin && (
          <Button
            className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-sm bg-purple text-md text-white"
            onClick={onAddAdmin}
          >
            Add Admin
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-col divide-y divide-border">
        {admins.length === 0 ? (
          <div className="py-10 text-center text-sm text-text-muted">
            No administrators found
          </div>
        ) : (
          admins.map((admin) => {
            const initials = admin.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={admin.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-bg-page"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-light font-semibold text-purple">
                    {initials}
                  </div>

                  <div>
                    <p className="font-medium text-text-primary">
                      {admin.fullName}
                    </p>

                    <p className="text-sm text-text-muted">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {admin.status === "pending" && onRegenerateCode && (
                    <Button
                      variant="secondary"
                      className="flex h-8 items-center gap-2 rounded-sm text-xs"
                      onClick={() => onRegenerateCode(admin)}
                    >
                      <RefreshCw size={14} />
                      Regenerate Code
                    </Button>
                  )}

                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                      admin.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    <ShieldCheck size={14} />
                    {admin.status === "pending"
                      ? "Pending"
                      : "School Admin"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
