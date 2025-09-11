import { defineConfig } from "prisma/config";

export default defineConfig({
  seed: "node --env-file=.env prisma/seed.mjs",
});
