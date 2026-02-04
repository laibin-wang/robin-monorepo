import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig([
    // ESM 和 CJS 构建
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.esm.js',
                format: 'esm',
                sourcemap: true,
                inlineDynamicImports: true
            },
            {
                file: 'dist/index.cjs.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'auto',
                inlineDynamicImports: true
            }
        ],
        plugins: [
            typescript({
                declaration: true,
                declarationDir: 'dist',
                rootDir: 'src',
                exclude: ['**/*.test.ts']
            })
        ]
    },
    // UMD 构建（压缩版）
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'CotcMonitor',
            sourcemap: true,
            inlineDynamicImports: true
        },
        plugins: [
            typescript({
                declaration: false,
                exclude: ['**/*.test.ts']
            }),
            terser()
        ]
    }
]);
