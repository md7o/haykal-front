import { z } from "zod";

// Common validation patterns
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

// Reusable field schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be less than 128 characters");
//   .regex(
//     passwordRegex,
//     "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
//   );

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be less than 20 characters")
  .regex(
    usernameRegex,
    "Username can only contain letters, numbers, underscores, and hyphens"
  );

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Sign up form schema
export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// TypeScript types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

// Validation helper functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: T
): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0]?.message };
    }
    return { isValid: false, error: "Validation failed" };
  }
};

// Real-time validation helpers
export const createFieldValidator = <T>(schema: z.ZodSchema<T>) => {
  return (value: T) => validateField(schema, value);
};
