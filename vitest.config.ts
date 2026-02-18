import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setupTests.ts"],
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        globals: true,
    },
});
