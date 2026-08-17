import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // react, react-dom and @react-spring/web are peer dependencies, so a
    // consumer's copy can end up alongside the one installed here. Two React
    // instances make every hook return null, so force a single copy.
    dedupe: ["react", "react-dom", "@react-spring/web", "@floating-ui/react"],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
    css: false,
  },
});
