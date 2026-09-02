import { mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';

const outdir = 'dist/browser';
await mkdir(outdir, { recursive: true });

const shared = {
  entryPoints: ['src/browser.ts'],
  bundle: true,
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
  globalName: 'WebtananJalali',
  sourcemap: true,
  legalComments: 'none',
};

await build({
  ...shared,
  outfile: `${outdir}/webtanan-jalali.js`,
  minify: false,
});

await build({
  ...shared,
  outfile: `${outdir}/webtanan-jalali.min.js`,
  sourcemap: false,
  minify: true,
});

await copyFile('src/ui/webtanan-jalali.css', `${outdir}/webtanan-jalali.css`);

console.log('Browser bundles generated in dist/browser.');
