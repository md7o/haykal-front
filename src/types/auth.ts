export interface AuthUser {
  userId: string;
  username?: string | null;
  email?: string | null;
  // Allow additional properties we might receive from backend
  [key: string]: unknown;
}
