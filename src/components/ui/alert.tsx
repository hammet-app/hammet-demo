import { ReactNode } from "react";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info 
} from "lucide-react";

type AlertProps = {
    variant?:
        | "info"
        | "success"
        | "warning"
        | "error";

    title?: string;

    children: ReactNode;
};

export function Alert({
    variant = "info",
    title,
    children,
}: AlertProps) {
  const styles = {
    info: {
      container:
        "border-cyan bg-cyan-light",
      icon:
        "text-cyan",
    },
    success: {
      container:
        "border-success bg-success-light",
      icon:
        "text-success-dark",
    },
    warning: {
      container:
        "border-warning bg-warning-light",
      icon:
        "text-warning-dark",
    },
    error: {
      container:
        "border-danger bg-danger-light",
      icon:
        "text-danger-dark",
    },
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };
  const Icon = icons[variant];

  const style = styles[variant];
  return (
    <div
      className={`flex gap-4 rounded-2xl border p-5 ${style.container} `}>
      <Icon
        size={22}
        className={style.icon}
      />

      <div className="flex-1">

        {title && (
          <h3 className="font-semibold text-text-primary">
            {title}
          </h3>
        )}

        <div className="mt-1 text-sm text-text-secondary">
          {children}
        </div>
      </div>
    </div>

    );

}