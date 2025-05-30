import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "app.ts",
    "server.ts",
    "config/**/*.ts",
    "controllers/**/*.ts",
    "middleware/**/*.ts",
    "models/**/*.ts",
    "routes/**/*.ts",
    "utils/**/*.ts",
    "!**/*.d.ts",
    "!**/*.test.ts",
    "!test/**",
    "!types/**",
    "!node_modules/**",
  ],
  outDir: "dist",
  target: "es2020",
  format: ["cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  noExternal: [],
  external: [
    "bcryptjs",
    "body-parser",
    "cloudinary",
    "cookie-parser",
    "cors",
    "crypto-js",
    "dotenv",
    "express",
    "express-fileupload",
    "jsonwebtoken",
    "mongodb",
    "mongoose",
    "swagger-jsdoc",
    "swagger-ui-express",
    "validator",
  ],
});
