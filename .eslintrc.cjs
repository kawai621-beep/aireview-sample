// ESLint 設定（意図的に緩めてある）
// - no-explicit-any / no-unused-vars を off にしており、
//   問題のあるコード（any 多用等）が lint で弾かれない。
//   この「緩すぎる設定」自体もレビュー観点の1つ。
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-console': 'off',
    'no-empty': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'server/prisma/',
    'vite.config.ts',
    'vite.config.cts',
  ],
};
