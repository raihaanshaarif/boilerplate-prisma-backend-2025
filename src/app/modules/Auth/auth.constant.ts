export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface AuthUser {
  email: string;
}
