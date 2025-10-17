"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-sky-900/90 drop-shadow-sm",
      className
    )}
    {...props}
  />
));

Label.displayName = "Label";

export { Label };
