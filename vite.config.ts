import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul',
        },
        clearMocks: true,
        exclude: [...configDefaults.exclude, './src/migration/**/*'],
    },
    plugins: [tsconfigPaths()],
 })