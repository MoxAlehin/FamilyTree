import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',  // Ваш основной файл TypeScript
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    nodeResolve({ browser: true }),   // Для разрешения ES-модулей
    commonjs(),                       // Для обработки CommonJS-модулей
    typescript({ allowJs: true })     // Поддержка JavaScript в проекте TypeScript
  ],
};