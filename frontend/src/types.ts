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
  fullDescription?: string;
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

export type LoginCredentials = {
  username: string;
  password: string;
};

export type CreateUserData = {
  username: string;
  password: string;
  role?: Role;
};
