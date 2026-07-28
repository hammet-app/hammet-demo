import {
    Download,
    RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type SuccessActionsProps = {
    onDownloadCSV: () => void;
    onImportAgain: () => void;
};

export function SuccessActions({
    onDownloadCSV,
    onImportAgain,
}: SuccessActionsProps) {
  return (

    <div className="flex flex-col gap-3 px-8 pb-8 sm:flex-row">
      <Button
        className="flex-1"
        onClick={onDownloadCSV}
      >
        <Download
            size={16}
        />

          Download Credentials
      </Button>

      <Button
          variant="secondary"
          className="flex-1"
          onClick={onImportAgain}
      >
        <RotateCcw
            size={16}
        />

        Import Another File
      </Button>

    </div>

  );
}