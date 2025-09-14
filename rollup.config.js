import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript";
import del from 'rollup-plugin-delete';

export default defineConfig([
    {
        input: "src/index.ts",
        output: [
            {
                file: 'dist/js/index.cjs.js',
                format: 'cjs',
                name: 'aggregate',
            },
            {
                file: 'dist/js/index.umd.js',
                format: 'umd',
                name: 'aggregate',
            },
            {
                file: 'dist/js/index.esm.js',
                format: 'esm',
                name: 'aggregate',
            },
        ],
        plugins: [
            typescript({
                exclude: ["node_modules"]
            }),
            del({
                targets: ['dist/js/*'],
                verbose: true
            })
        ],
    },
    {
        input: "bin/cli.ts",
        output: [
            {
                file: 'dist/cli.js',
                format: 'cjs',
                banner: '#!/usr/bin/env node'
            },
        ],
        plugins: [
            typescript({
                exclude: ["node_modules"]
            }),
            del({
                targets: ['dist/cli.js'],
                verbose: true
            })
        ],
    }
]);