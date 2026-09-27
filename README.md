# Site Inspector

A Chrome extension (Manifest V3) for quickly inspecting any webpage. Open the popup on any site to see its links, images, resources, performance details, security status, and SEO meta tags — no DevTools required.

## Features

- **Links** — Lists every link on the page with its text/label, count, and clickable outbound links.
- **Images** — Grid of all images on the page with:
  - Dimensions and load status indicators
  - Click-to-zoom modal preview
  - One-click download button
  - Automatic retries with exponential backoff and graceful placeholders for CORS-blocked images
- **Resources** — Scripts and stylesheets detected on the page, with a "View All Resources" page (`resources.html`) for the full list.
- **Page Details**
  - Load time, script/stylesheet counts
  - DOM node count and text length
  - Security status: HTTPS check and mixed-content detection
- **SEO / Meta Tags** — All `<meta>` tags (name, property, http-equiv) with their content.
- **Collapsible sections** and **dark mode** support (follows your system theme).
- **Keyboard shortcut** — `Ctrl+Shift+Z` (Mac: `Cmd+Shift+Z`) opens the inspector.

## Installation

1. Download or clone this repository:
   ```bash
   git clone https://github.com/gamer-09/site-inspect-chrome.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the cloned folder.
5. Pin the extension and click the icon (or press `Ctrl+Shift+Z`) on any page.

## Usage

1. Navigate to the page you want to inspect.
2. Click the **Site Inspector** icon in the toolbar.
3. The popup shows the page URL and title, then expand/collapse sections for Links, Images, Resources, and Page Details.
4. Click any image to preview it in a modal, or use the download button to save it.
5. Click **View All Resources** to see every script and stylesheet in a full-page view.

> Note: `chrome://` and other restricted browser pages cannot be inspected for security reasons.

## Testing

A `test.html` page is included to exercise the extension's features (meta tags, local/external/CORS images, and various link types). Load it in Chrome and run the inspector on it.

## Project Structure

```
├── manifest.json        # Extension manifest (MV3)
├── popup.html / .js     # Main inspector popup
├── resources.html / .js # Full-page resources viewer
├── sheets.html / .js    # Google Sheets viewer helper page
├── styles.css           # Shared styles (light/dark)
├── test.html            # Manual test page
├── images/              # Extension icons
└── profile/             # Profile image
```

## Permissions

| Permission | Why |
|---|---|
| `activeTab`, `scripting` | Inject the analysis script into the current tab when you open the popup |
| `tabs` | Read the active tab's URL and title |
| `storage` | Store extension settings |
| `<all_urls>` (host) | Allow inspection on any site you visit |

## License

MIT
