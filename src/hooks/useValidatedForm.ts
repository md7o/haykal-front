import { useState, useCallback } from "react";
import { z } from "zod";

// Simple validation states for form submission
export function useFormSubmission<T>() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitForm = useCallback(
    async (onSubmit: (data: T) => Promise<void> | void, data: T) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        await onSubmit(data);
        setSubmitSuccess(true);
      } catch (error) {
        const errorMessage = 
          error instanceof Error 
            ? error.message 
            : "An unexpected error occurred. Please try again.";
        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSubmitSuccess(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submitForm,
    clearError,
    clearSuccess,
  };
}

// Real-time validation hook for individual fields
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  value: T,
  touched: boolean = false
) {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    try {
      schema.parse(value);
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Validation failed");
      }
      return false;
    }
  }, [schema, value]);

  const isValid = error === null && touched;

  return {
    error: touched ? error : null,
    isValid,
    validate,
  };
}
