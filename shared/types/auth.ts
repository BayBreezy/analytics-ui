export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "manager" | "staff";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface OkResponse {
  ok: true;
  message: string;
}
