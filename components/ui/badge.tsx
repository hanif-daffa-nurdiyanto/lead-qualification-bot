import * as React from "react"

import { cn } from "@/lib/utils"

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-7 items-center border px-2.5 text-xs font-semibold whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
