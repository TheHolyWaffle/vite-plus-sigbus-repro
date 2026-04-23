import { defineConfig } from 'vite-plus';

export default defineConfig({
    test: { passWithNoTests: true },
    run: {
        tasks: {
            test: { command: 'vp test --run' },
        },
    },
});
