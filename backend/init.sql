-- Create Role Enum
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create User Table
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role "Role" DEFAULT 'USER' NOT NULL
);

-- Create Photo Table
CREATE TABLE IF NOT EXISTS "Photo" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "fullDescription" TEXT,
    filename TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Video Table
CREATE TABLE IF NOT EXISTS "Video" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "fullDescription" TEXT,
    filename TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- Insert default admin (password: admin123) — для прода обязательно смените пароль
INSERT INTO "User" (username, password, role)
VALUES ('admin', '$2b$10$vMW1wSfRhvq8bIjAdBx/m.QT5AWwvwr9wa.S10axX1f.7uDoRSZxK', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
