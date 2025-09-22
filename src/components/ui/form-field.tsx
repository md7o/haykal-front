import { forwardRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, touched, helperText, className, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = touched && error;

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className={cn("text-sm font-medium transition-colors", hasError ? "text-red-500" : "text-title")}>
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            className={cn(
              "transition-all duration-200 bg-white",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              isFocused && !hasError && "border-accent focus:border-accent",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {(hasError || helperText) && (
          <div className="min-h-[1.25rem]">
            {hasError ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            ) : (
              helperText && <p className="text-sm text-description">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
