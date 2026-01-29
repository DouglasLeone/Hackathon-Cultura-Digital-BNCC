/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/test/integration/**/*.test.ts'],
        setupFiles: ['./src/test/setupIntegration.ts'],
        globals: true,
        environment: 'node', // Firestore Emulator works better in node env usually, or jsdom. Node is faster for repo tests.
        // If we were testing React Components, we'd need jsdom.
        // For pure logic/repo integration, node is fine.
        maxConcurrency: 1, // Sequential execution to avoid DB collisions if not randomly isolated
        fileParallelism: false // Sequential files
    },
});
