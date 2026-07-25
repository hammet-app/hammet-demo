import { Card } from "@/components/cards/common/Card";
import { Button } from "@/components/ui";
import { Dispute } from "@/lib/api/types";
import { StatusBadge } from "../../../badges/StatusBadge";

type DisputeTableProps = {
  disputes: Dispute[];
  onReview: (dispute: Dispute) => void;
};

export function DisputeTable({
  disputes,
  onReview,
}: DisputeTableProps) {
  return (
    <Card className="overflow-hidden p-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
      <table className="w-full">
        <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
          <tr className="text-left">
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Student
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Module
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Score
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Date
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {disputes.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No disputes found.
              </td>
            </tr>
          ) : (
            disputes.map((dispute) => (
              <tr 
                key={dispute.id}
                className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-100">
                  {dispute.studentId.slice(0, 4)}...
                  {dispute.studentId.slice(-4)}
                </td>

                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {dispute.moduleTitle}
                </td>

                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  <StatusBadge status={dispute.aiStatus} />
                </td>

                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {dispute.aiScore}
                </td>

                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {new Date(
                    dispute.disputedAt
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  <Button
                    onClick={() => onReview(dispute)}
                  >
                    Review
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}