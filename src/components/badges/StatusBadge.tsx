import { cn } from "@/lib/utils/utils";

const statusStyles: Record<
  string,
  {
    bg: string;
    text: string;
  }
> = {
  FLAGGED: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
  },

  APPROVED: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
  },

  NEEDS_REVIEW: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
  },

  REJECTED: {
    bg: "bg-gray-200 dark:bg-zinc-700",
    text: "text-gray-700 dark:text-gray-200",
  },
};

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    statusStyles[status] ?? {
      bg: "bg-gray-100 dark:bg-zinc-800",
      text: "text-gray-700 dark:text-gray-300",
    };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        style.bg,
        style.text
      )}
    >
      {status}
    </span>
  );
}