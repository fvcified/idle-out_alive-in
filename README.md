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

### Chrome / Edge

1. Get a copy of this repository
2. `npm install`
3. `npm run build` (compiles `src/` into `dist/`)
4. Open `chrome://extensions` (or `edge://extensions`)
5. Enable **Developer mode**
6. Click **Load unpacked** and select the `dist/` folder (not the repo root)

### Firefox

1. Get a copy of this repository
2. `npm install`
3. `npm run build:firefox` (compiles `src/` into `dist-firefox/`)
4. Open `about:debugging#/runtime/this-firefox`
5. Click **Load Temporary Add-on**
6. Select any file inside the `dist-firefox/` folder

> **Note:** Firefox only supports temporary add-ons for unsigned extensions. The extension will be unloaded when Firefox is closed. To use it permanently, the extension must be signed via [AMO](https://addons.mozilla.org).

## Usage

1. Open the site you want to enable the extension on
2. Click the toolbar icon to add that hostname to the active list; the tab reloads automatically
3. (Optional) Open Options to choose which features are active, set policies, or manage the host list in bulk

## Development

Source lives in `src/` as TypeScript, built with esbuild into `dist/` (the folder you actually load into the browser). `public/` holds static assets (manifest, icons, options page markup/CSS) copied into `dist/` as-is on every build.

```bash
npm run dev            # watch mode for Chrome/Edge
npm run dev:firefox    # watch mode for Firefox
npm run build          # production build for Chrome/Edge
npm run build:firefox  # production build for Firefox
npm run check          # full TypeScript type-check (tsc)
```

Chrome doesn't auto-reload extensions when `dist/` changes after a rebuild, click the reload icon on the extension's card in `chrome://extensions`. If you edited `content.ts` or `inject.ts`, also refresh the tab you're testing on so the content script re-injects.

## Project Structure

```plain
idle-out_alive-in/
├─ .git/
├─ dist/ <- Build output, load THIS folder in chrome://extensions/ and find "Load unpacked"
├─ dist-firefox/ <- Firefox build output
├─ node_modules/
├─ public/ <- Static assets, copied as-is into dist/
│  ├─ data/options/
│  │  ├─ index.html
│  │  └─ css.css
│  ├─ icons/
│  │  ├─ wcat-16.png
│  │  ├─ wcat-48.png
│  │  ├─ wcat-128.png
│  │  ├─ wcat-256.png
│  │  └─ wcat.png
│  ├─ manifest.json
├─ src/ <- TypeScript source
│  ├─ lib/
│  │  └─ hosts.ts
│  ├─ types/
│  │  ├─ globals.d.ts
│  │  ├─ messages.ts
│  │  └─ prefs.ts
│  ├─ background.ts
│  ├─ content.ts
│  ├─ inject.ts
│  ├─ options.ts
├─ .gitignore
├─ build.mjs
├─ package-lock.json
├─ package.json
├─ README.md
└─ tsconfig.json
```

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/fvcified/idle-out_alive-in/issues).

If you'd like to modify or build on this, feel free to [fork the repository](https://github.com/fvcified/idle-out_alive-in/fork). It's yours to keep and modify however you like.

## Credit & Reference

The concept and part of the technical approach (overriding visibility properties, blocking visibility related events, per hostname whitelisting) was inspired by the [Always Active Window](https://webextension.org/listing/always-active.html) extension.

## Note

This project is a personal experiment built for my own use, with no guarantee of full compatibility on every site.
