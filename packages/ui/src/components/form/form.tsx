import * as React from "react";
import { GlobalError, useFormState } from "react-hook-form";

import { cn } from "@/lib/utils";

const FormRootError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { errors } = useFormState();
    const rootError = errors.root ?? (props.id ? (errors[props.id] as GlobalError) : undefined);
    if (!rootError) return null;
    return (
      <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {rootError.message}
      </p>
    );
  },
);
FormRootError.displayName = "FormRootError";

export { FormRootError };
