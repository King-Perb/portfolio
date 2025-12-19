import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    css: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/e2e/**", // Exclude Playwright E2E tests
      "**/*.e2e.{ts,tsx}",
      "**/*.spec.ts", // Exclude Playwright spec files
    ],
    coverage: {
      provider: "v8",
      exclude: [
        // Type definition files (no testable logic)
        "src/types/**",
        // Config files (no testable logic)
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "vitest.config.ts",
        // Test files themselves
        "**/*.test.{ts,tsx}",
        "**/__tests__/**",
        "**/test/**",
        // Setup files
        "src/test/**",
        // Build outputs
        "**/*.d.ts",
        "**/dist/**",
        "**/build/**",
        ".next/**",
        "node_modules/**",
        // Documentation
        "doc/**",
        "**/*.md",
        // Public assets
        "public/**",
        // UI component library (shadcn/ui - thin wrappers around Radix UI)
        // These are third-party component wrappers with minimal logic
        // Testing them would be testing Radix UI itself, which is already tested
        "src/components/ui/**",
        // Data-only files (no logic, just exports)
        "src/data/manual-technologies.ts",
        "src/data/mock-data.ts",
        // Theme provider (thin wrapper around next-themes)
        "src/components/theme-provider.tsx",
      ],
      include: [
        "src/**/*.{ts,tsx}",
        // Include root config files if they have testable logic (currently none do)
        // "next.config.ts", // Empty config, no logic to test
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
