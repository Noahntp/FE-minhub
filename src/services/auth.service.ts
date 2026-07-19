import {
  api,
  clearSessionToken,
  saveSessionToken,
} from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "instructor" | "learner";
  status: string;
}

interface LoginResponse {
  user?: AuthUser;

  data?: {
    user?: AuthUser;
    session_token?: string;
    token?: string;
  };

  session_token?: string;
  token?: string;
  message?: string;
}

export async function login(
  payload: LoginPayload,
): Promise<AuthUser> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  const body = response.data;

  const sessionToken =
    body.session_token ??
    body.token ??
    body.data?.session_token ??
    body.data?.token;

  if (sessionToken) {
    saveSessionToken(sessionToken);
  }

  const user =
    body.user ??
    body.data?.user;

  if (!user) {
    throw new Error(
      "Đăng nhập thành công nhưng response không có user.",
    );
  }

  return user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<{
    data?: AuthUser;
    user?: AuthUser;
  }>("/users/me");

  const user =
    response.data.data ??
    response.data.user;

  if (!user) {
    throw new Error(
      "API /users/me không trả thông tin user.",
    );
  }

  return user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    clearSessionToken();
  }
}

export async function register(payload: any): Promise<AuthUser> {
  const response = await api.post<LoginResponse>("/auth/register", payload);
  const body = response.data;
  
  const sessionToken =
    body.session_token ??
    body.token ??
    body.data?.session_token ??
    body.data?.token;

  if (sessionToken) {
    saveSessionToken(sessionToken);
  }

  const user = body.user ?? body.data?.user;
  if (!user) {
    throw new Error("Đăng ký thành công nhưng response không có user.");
  }
  return user;
}
