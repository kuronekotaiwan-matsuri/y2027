import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      // 静的エクスポート + images.unoptimized のため next/image の最適化は効かない。
      // 書き手が置いた画像をそのまま表示する方針（仕様書 9.7）なので素の <img> を使う。
      '@next/next/no-img-element': 'off',
    },
  },
]);

export default eslintConfig;
