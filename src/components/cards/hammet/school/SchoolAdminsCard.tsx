import { AdminDetails } from "@/lib/api/types";
import { Button } from "@/components/ui";
import { ShieldCheck, User } from "lucide-react";

type SchoolAdminsCardProps = {
  admins: AdminDetails[];
  onAddAdmin?: () => void;
}

export function SchoolAdminsCard({
  admins,
  onAddAdmin,
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
            Users who administrative access.
          </p>
        </div>

        {onAddAdmin && (
          <Button 
            className="h-8 rounded-sm bg-purple text-white flex items-center justify-center gap-2 text-md cursor-pointer" 
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

                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <ShieldCheck size={14} />
                  School Admin
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}