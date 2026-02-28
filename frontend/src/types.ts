export type Role = "ADMIN" | "USER";

export type UserType = {
  id: number;
  username: string;
  role: Role;
};

export type PhotoType = {
  id: number;
  title: string;
  description?: string;
  filename: string;
  createdAt: string;
  userId: number;
  user?: {
    id: number;
    username: string;
  };
};

export type AuthResponse = {
  token: string;
  user: UserType;
};
