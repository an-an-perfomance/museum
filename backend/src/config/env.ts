import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  databaseUrl:
    process.env.DATABASE_URL ?? "postgres://user:password@localhost:5432/muzeum",
};

