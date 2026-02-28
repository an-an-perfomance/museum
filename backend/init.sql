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
    filename TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- Insert default admin (password: admin123)
-- $2a$10$8K1p/a2L2W6W6W6W6W6W6u (example hash for admin123)
INSERT INTO "User" (username, password, role)
VALUES ('admin', '$2a$10$8K1p/a2L2W6W6W6W6W6W6u', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
