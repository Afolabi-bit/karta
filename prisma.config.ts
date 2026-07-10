import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/karta",
  },
});
