import type { PhotoType, UserType, AuthResponse, LoginCredentials, CreateUserData } from "./types";

const API_BASE =
  typeof import.meta.env?.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5000/api";

/** Базовый URL для статики (uploads), без /api */
const UPLOADS_BASE =
  typeof import.meta.env?.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") || "http://localhost:5000"
    : "http://localhost:5000";

export function getUploadsUrl(filename: string): string {
  return `${UPLOADS_BASE}/uploads/${filename}`;
}

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchPhotos(): Promise<PhotoType[]> {
  const res = await fetch(`${API_BASE}/photos`);
  if (!res.ok) throw new Error("Не удалось загрузить фотографии");
  return res.json();
}

export async function getPhotoById(id: number): Promise<PhotoType> {
  const res = await fetch(`${API_BASE}/photos/${id}`);
  if (!res.ok) throw new Error("Фотография не найдена");
  return res.json();
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Ошибка авторизации");
  return res.json();
}

export async function getUsers(): Promise<UserType[]> {
  const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Ошибка при получении пользователей");
  return res.json();
}

export async function createUser(data: CreateUserData): Promise<UserType> {
  const res = await fetch(`${API_BASE}/users/admin/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка при создании пользователя");
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при удалении пользователя");
}

export async function resetUserPassword(id: number): Promise<{ newPassword: string }> {
  const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при сбросе пароля");
  return res.json();
}

export async function uploadPhoto(formData: FormData): Promise<PhotoType> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/photos`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Ошибка при загрузке фото");
  return res.json();
}

export async function updatePhoto(id: number, data: { title: string; description?: string }): Promise<PhotoType> {
  const res = await fetch(`${API_BASE}/photos/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка при обновлении фото");
  return res.json();
}

export async function deletePhotos(ids: number[]): Promise<void> {
  const res = await fetch(`${API_BASE}/photos`, {
    method: "DELETE",
    headers: getHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Ошибка при удалении фото");
}
