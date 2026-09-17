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
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select this project's folder

## Usage

1. Open the site you want to enable the extension on
2. Click the toolbar icon to add that hostname to the active list; the tab reloads automatically
3. (Optional) Open Options to choose which features are active, set policies, or manage the host list in bulk

## Project Structure

```plain
idle-out_alive-in/
├─ .git/
├─ data/
│  └─ options/
│     ├─ css.css
│     ├─ index.html
│     └─ js.js
├─ icons/
│  └─ wcat-16.png
│  └─ wcat-48.png
│  └─ wcat-128.png
│  └─ wcat-256.png
│  └─ wcat.png
├─ background.js
├─ content.js
├─ inject.js
├─ manifest.json
└─ README.md
```

## Credit & Reference

The concept and part of the technical approach (overriding visibility properties, blocking visibility related events, per hostname whitelisting) was inspired by the [Always Active Window](https://webextension.org/listing/always-active.html) extension.

## Note

This project is a personal experiment built for my own use, with no guarantee of full compatibility on every site. If you'd like to use or modify it, feel free to fork this repository.
