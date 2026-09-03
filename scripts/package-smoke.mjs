import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/framework/react.js',
  'dist/framework/react.d.ts',
  'dist/framework/vue.js',
  'dist/framework/vue.d.ts',
  'dist/browser/webtanan-jalali.js',
  'dist/browser/webtanan-jalali.min.js',
  'dist/browser/webtanan-jalali.css',
  'demo/index.html',
  'demo/crm.html',
  'demo/sales.html',
  'demo/accounting.html',
  'demo/production.html',
  'demo/shared.css',
  'docs/API_FA.md',
];

for (const file of requiredFiles) {
  await access(file);
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const requiredExports = ['.', './react', './vue', './browser', './browser.min', './css'];
for (const name of requiredExports) {
  if (!packageJson.exports?.[name]) {
    throw new Error(`package export missing: ${name}`);
  }
}

for (const demo of ['crm.html', 'sales.html', 'accounting.html', 'production.html']) {
  const html = await readFile(`demo/${demo}`, 'utf8');
  if (!html.includes('../dist/browser/webtanan-jalali.js')) {
    throw new Error(`${demo} does not reference browser bundle`);
  }
  if (!html.includes('../dist/browser/webtanan-jalali.css')) {
    throw new Error(`${demo} does not reference calendar CSS`);
  }
}

const browserBundle = await readFile('dist/browser/webtanan-jalali.js', 'utf8');
if (!browserBundle.includes('WebtananJalali')) {
  throw new Error('Browser global WebtananJalali was not generated.');
}

console.log(`Package smoke test passed: ${requiredFiles.length} files and ${requiredExports.length} exports verified.`);
