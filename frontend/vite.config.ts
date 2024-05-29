import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import envCompatible from "vite-plugin-env-compatible";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [
      envCompatible({ prefix: "" }),
      react(),
      viteTsconfigPaths(),
      svgr({ svgrOptions: { icon: true } }),
    ],
    server: {
      port: 3000,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
      exclude: [...configDefaults.exclude, "./src/tests/**"],
    },
  };
});
