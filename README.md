# Idle Out, Alive In

A Manifest V3 browser extension that prevents idle timeouts by simulating an active/visible tab, and blocks some events sites commonly use to detect when you switch tabs or lose focus.

The extension is **OFF by default** on every site. You need to enable it per hostname, either by clicking the toolbar icon or through the Options page.

## Features

### Visibility Overrides *(experimental)*

- Override `document.visibilityState` to always return `"visible"`
- Override `document.hidden` to always return `false`

### Event Blocking

- Globally block: `blur`, `focus`, `visibilitychange`, `mouseleave`, `mouseout`, `lostpointercapture`
- Block JS redirects while the page is hidden (requires the Navigation API, automatically disabled on browsers that don't support it)

### Per hostname

- Click the toolbar icon to toggle a site on/off (an "ON" badge appears when active)
- Add multiple hosts at once from the Options textarea (wildcards supported, e.g. `*.example.com`)
- **Policies**: a per hostname JSON object to exclude specific events from blocking, for example:

  ```json
  { "docs.google.com": ["blur"] }
  ```

### Other

- Logging mode for debugging (`console.log`)
- Auto opens the FAQ page after updates (can be disabled)

## Installation (manual / unpacked)

1. Clone or download this repo
2. `npm install`
3. `npm run build` — compiles `src/` into `dist/`
4. Open `chrome://extensions` (or `edge://extensions`)
5. Enable **Developer mode**
6. Click **Load unpacked** and select the `dist/` folder (not the repo root)

## Usage

1. Open the site you want to enable the extension on
2. Click the toolbar icon to add that hostname to the active list; the tab reloads automatically
3. (Optional) Open Options to choose which features are active, set policies, or manage the host list in bulk

## Development

Source lives in `src/` as TypeScript, built with esbuild into `dist/` (the folder you actually load into the browser). `public/` holds static assets (manifest, icons, options page markup/CSS) copied into `dist/` as-is on every build.

```bash
npm run dev     # watch mode, rebuilds dist/ on save
npm run build   # one-off production build (minified, no sourcemaps)
npm run check   # full TypeScript type-check (tsc)
```

Chrome doesn't auto-reload extensions when `dist/` changes — after a rebuild, click the reload icon on the extension's card in `chrome://extensions`. If you edited `content.ts` or `inject.ts`, also refresh the tab you're testing on so the content script re-injects.

## Project Structure

```plain
idle-out_alive-in/
├─ .git/
├─ src/                     <- TypeScript source
│  ├─ background.ts
│  ├─ content.ts
│  ├─ inject.ts
│  ├─ options.ts
│  ├─ lib/
│  │  └─ hosts.ts
│  └─ types/
│     ├─ prefs.ts
│     ├─ messages.ts
│     └─ globals.d.ts
├─ public/                  <- Static assets, copied as-is into dist/
│  ├─ manifest.json
│  ├─ icons/
│  └─ data/options/
│     ├─ index.html
│     └─ css.css
├─ dist/                    <- Build output, load THIS folder in chrome://extensions/ and find "Load unpacked"
├─ build.mjs
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Credit & Reference

The concept and part of the technical approach (overriding visibility properties, blocking visibility related events, per hostname whitelisting) was inspired by the [Always Active Window](https://webextension.org/listing/always-active.html) extension.

## Note

This project is a personal experiment built for my own use, with no guarantee of full compatibility on every site. If you'd like to use or modify it, feel free to fork this repository.
