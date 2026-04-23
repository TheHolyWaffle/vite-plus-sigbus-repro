import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: { passWithNoTests: true },
  run: {
    tasks: {
      test: { command: "vp test --run" },
    },
  },
});
