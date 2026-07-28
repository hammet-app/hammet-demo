import { cn } from "@/lib/utils/utils"
import { ReactNode } from "react"

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({
  children,
  className,
}: CardProps) {
  return (
    <div 
      className={cn(
      "rounded-2xl border border-border bg-bg-page shadow-sm p-6 flex flex-col gap-4 transition-all duration-200",
      className
      )}
    >
      {children}
    </div>
  )
}