import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const requiredFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/esm/index.mjs',
  'dist/esm/react.mjs',
  'dist/esm/vue.mjs',
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
  'demo/work-calendar.html',
  'demo/shared.css',
  'docs/API_FA.md',
];

for (const file of requiredFiles) await access(file);

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const requiredExports = ['.', './react', './vue', './browser', './browser.min', './css', './package.json'];
for (const name of requiredExports) {
  if (!packageJson.exports?.[name]) throw new Error(`package export missing: ${name}`);
}

if (packageJson.exports['.']?.import !== './dist/esm/index.mjs') throw new Error('ESM root export is not configured correctly.');
if (packageJson.exports['.']?.require !== './dist/index.js') throw new Error('CommonJS root export is not configured correctly.');

for (const demo of ['crm.html', 'sales.html', 'accounting.html', 'production.html', 'work-calendar.html']) {
  const html = await readFile(`demo/${demo}`, 'utf8');
  if (!html.includes('../dist/browser/webtanan-jalali.js')) throw new Error(`${demo} does not reference browser bundle`);
  if (!html.includes('../dist/browser/webtanan-jalali.css')) throw new Error(`${demo} does not reference calendar CSS`);
}

const browserBundle = await readFile('dist/browser/webtanan-jalali.js', 'utf8');
if (!browserBundle.includes('WebtananJalali')) throw new Error('Browser global WebtananJalali was not generated.');

const esm = await import(pathToFileURL(`${process.cwd()}/dist/esm/index.mjs`).href);
if (esm.JalaliConverter.isLeapYear(1360) !== false) throw new Error('ESM JalaliConverter leap-year smoke failed.');
if (esm.JalaliConverter.isLeapYear(1358) !== true) throw new Error('ESM leap-year historical smoke failed.');
if (esm.JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 }) !== '2026-09-02') throw new Error('ESM conversion smoke failed.');
for (const name of ['AccountingCalendarAdapter', 'BusinessDayCalculator', 'BigWorkCalendar', 'WorkTaskManager', 'MemoryWorkTaskRepository', 'IndexedDbWorkTaskRepository', 'SqlWorkTaskRepository', 'WorkTaskPersistence']) {
  if (typeof esm[name] !== 'function') throw new Error(`ESM export missing: ${name}`);
}
const manager = new esm.WorkTaskManager();
manager.add({ id: 'smoke', date: '1405/06/11', title: 'Smoke task' });
if (manager.getByDate('1405/06/11').length !== 1) throw new Error('WorkTaskManager smoke failed.');

const require = createRequire(import.meta.url);
const cjs = require(`${process.cwd()}/dist/index.js`);
if (cjs.JalaliConverter.isLeapYear(1360) !== false) throw new Error('CommonJS leap-year smoke failed.');
if (cjs.JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 }) !== '2026-09-02') throw new Error('CommonJS conversion smoke failed.');
if (typeof cjs.BigWorkCalendar !== 'function' || typeof cjs.WorkTaskPersistence !== 'function') throw new Error('CommonJS work calendar exports are incomplete.');

console.log(`Package smoke test passed: ${requiredFiles.length} files, ${requiredExports.length} exports, work calendar, ESM and CommonJS verified.`);
