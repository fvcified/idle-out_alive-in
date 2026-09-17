import * as esbuild from 'esbuild';
import { cp, rm, writeFile, readFile } from 'node:fs/promises';

const watch = process.argv.includes('--watch');
const prod = process.argv.includes('--prod');
const firefox = process.argv.includes('--firefox');

const outdir = firefox ? 'dist-firefox' : 'dist';

await rm(outdir, { recursive: true, force: true });
await cp('public', outdir, { recursive: true });

const manifestPath = `${outdir}/manifest.json`;
const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));

if (firefox) {
  manifest.browser_specific_settings = {
    gecko: {
      id: 'idle-out-alive-in@fvcified',
      strict_min_version: '128.0',
    },
  };
} else {
  delete manifest.browser_specific_settings;
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

const ctx = await esbuild.context({
  entryPoints: {
    background: 'src/background.ts',
    content: 'src/content.ts',
    inject: 'src/inject.ts',
    'data/options/js': 'src/options.ts',
  },
  outdir,
  bundle: true,
  format: 'iife',
  target: firefox ? 'firefox128' : 'chrome110',
  minify: prod,
  sourcemap: prod ? false : 'inline',
  logLevel: 'info',
});

if (watch) {
  await ctx.watch();
  console.log(`Watching for changes... [${firefox ? 'Firefox' : 'Chrome'}]`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
}