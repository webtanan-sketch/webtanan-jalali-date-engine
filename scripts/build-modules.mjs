import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

const outdir = 'dist/esm';
await mkdir(outdir, { recursive: true });

const shared = {
  bundle: true,
  platform: 'neutral',
  target: ['es2020'],
  format: 'esm',
  sourcemap: true,
  legalComments: 'none',
};

await build({
  ...shared,
  entryPoints: ['src/index.ts'],
  outfile: `${outdir}/index.mjs`,
});

await build({
  ...shared,
  entryPoints: ['src/framework/react.ts'],
  outfile: `${outdir}/react.mjs`,
  external: ['react'],
});

await build({
  ...shared,
  entryPoints: ['src/framework/vue.ts'],
  outfile: `${outdir}/vue.mjs`,
  external: ['vue'],
});

console.log('ESM bundles generated in dist/esm.');
