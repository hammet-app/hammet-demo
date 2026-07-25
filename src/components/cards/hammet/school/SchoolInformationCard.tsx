import { SchoolDetails } from "@/lib/api/types"

type SICProps = {
  school: SchoolDetails
  tierLabel: string
}

type SIRProps = {
  label: string;
  value: string;
}

export function SchoolInformationCard({
  school,
  tierLabel
}: SICProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6">
      <h2 className="text-lg font-semibold mb-5">
        School Information
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <SchoolInfoRow
          label="Email"
          value={school.email}
        />

        <SchoolInfoRow
          label="Phone"
          value={school.phoneNumber}
        />

        <SchoolInfoRow
          label="Address"
          value={school.address}
        />

        <SchoolInfoRow
          label="Website"
          value={school.website || "Not provided"}
        />

        <SchoolInfoRow
          label="Tier"
          value={tierLabel}
        />

        <SchoolInfoRow
          label="Created"
          value={new Date(school.createdAt).toLocaleDateString()}
        />

      </div>
    </div>
  )
}

export function SchoolInfoRow({
  label,
  value
}: SIRProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>

      <span className="text-sm text-text-primary break-words">
        {value}
      </span>
    </div>
  )
}