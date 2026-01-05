import { defineConfig } from 'vite';
import path from 'path';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  resolve: {
    alias: {
      'textmode.synth.js': path.resolve(__dirname, 'src/index.ts'),
    }
  },
  server: {
    open: '/examples/index.html',
  },
  build: {
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'TextmodeSynth',
      fileName: (format) => `textmode.synth.${format === 'es' ? 'esm' : format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      plugins: [
        terser({
          compress: {
            drop_debugger: true,
            ecma: 2020,
            // Disable toplevel for UMD compatibility
            toplevel: false,
            // Reduce unsafe optimizations for UMD
            unsafe: false,
            global_defs: {
              IS_MINIFIED: true
            }
          },
          mangle: {
            toplevel: false,
            // Disable property mangling for UMD builds to avoid syntax errors
            properties: false,
            reserved: ['TextmodeSynth']
          },
          format: {
            comments: false,
            ecma: 2020
          },
          // Module mode only works reliably with ESM, not UMD
          module: false
        })
      ],
      // Make sure to externalize deps that shouldn't be bundled
      external: ['textmode.js'],
      output: {
        globals: {
          'textmode.js': 'textmode'
        }
      },
      treeshake: {
        preset: 'smallest'
      }
    }
  }
});