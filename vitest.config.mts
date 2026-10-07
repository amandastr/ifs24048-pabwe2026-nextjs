import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: [
        "node_modules/",
        "src/setupTests.ts",
        "src/test-utils.tsx",
        "src/types/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/next.config.ts",
        "**/postcss.config.mjs",
        "src/server.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});