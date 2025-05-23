import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**"], // <-- ignore dist folder
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**/*.ts", "./tests/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // <-- only applies to test files
    },
  },
]);
