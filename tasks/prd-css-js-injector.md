# PRD: CSS & JS Injector — Chrome Browser Extension

## Introduction

A Chrome browser extension that allows users to inject custom CSS and JavaScript into web pages based on configurable URL patterns. The extension targets personal productivity use cases — customizing the appearance and behavior of websites the user visits daily. Users can create, edit, enable/disable, and manage injection scripts through a clean popup/options UI with a built-in code editor featuring syntax highlighting.

## Goals

- Allow users to create custom CSS overrides for any website
- Allow users to inject custom JavaScript into any website
- Support wildcard/glob URL patterns for flexible targeting (e.g., `https://example.com/*`)
- Provide a code editor with syntax highlighting for editing CSS and JS
- Enable/disable individual scripts without deleting them
- Inject scripts after page load with a configurable delay (in milliseconds)
- Persist all configurations in Chrome storage (synced across devices)

## Tech Stack

### Runtime & Build

- **Node.js:** v22.22.2
- **Package Manager:** npm (ships with Node.js)
- **Build Tool:** Vite (for bundling extension pages, background service worker, and content scripts)

### UI Framework & Styling

- **Framework:** Next.js (static export mode for extension pages — popup & options)
- **Language:** TypeScript
- **CSS Framework:** TailwindCSS
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/) (copy-paste component primitives built on Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/) (consistent, lightweight icon set)

### UI Design Tokens

| Token | Value |
|---|---|
| Main / Primary Color | `#02abff` |
| Border Radius | `rounded-md` (6px) |
| Design Style | Minimal, clean, modern |
| Target Platform | Desktop only (no mobile/responsive breakpoints) |

### Extension APIs

- **Manifest Version:** V3
- **Storage:** `chrome.storage.sync` (fallback to `chrome.storage.local` for large data)
- **Script Injection:** `chrome.scripting.insertCSS` / `chrome.scripting.executeScript`
- **Navigation Events:** `chrome.tabs.onUpdated`

### Code Editor

- **Editor:** CodeMirror 6 (lightweight, extensible, browser-extension friendly)
- Syntax highlighting for CSS and JavaScript
- Line numbers, bracket matching, auto-indent

## User Stories

### US-001: Create a New Script Entry

**Description:** As a user, I want to create a new script entry so that I can define custom CSS or JS for a specific website.

**Acceptance Criteria:**

- [ ] User can click a "New Script" button from the extension popup or options page
- [ ] User is prompted to enter: script name, script type (CSS or JS), and URL pattern
- [ ] A new entry is created with default empty content and enabled state
- [ ] Entry is persisted in Chrome storage
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-002: Edit Script Content

**Description:** As a user, I want to edit my script's CSS or JS code in a syntax-highlighted editor so that I can write and modify code comfortably.

**Acceptance Criteria:**

- [ ] Clicking "Edit" on a script entry opens a code editor (CodeMirror or Monaco)
- [ ] Editor provides syntax highlighting for CSS and JavaScript
- [ ] Editor supports basic features: line numbers, bracket matching, auto-indent
- [ ] Changes are saved when the user clicks "Save" or via auto-save
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-003: Configure URL Pattern

**Description:** As a user, I want to set a wildcard/glob URL pattern for each script so that it applies to the right pages.

**Acceptance Criteria:**

- [ ] Each script entry has a URL pattern field
- [ ] URL patterns support glob/wildcard syntax (e.g., `*://github.com/*`, `https://example.com/dashboard/*`)
- [ ] Multiple URL patterns can be specified per script (comma-separated or multi-line)
- [ ] URL pattern is validated on save (basic format check)
- [ ] A "Test URL" input allows users to verify if a URL matches their pattern
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-004: Enable/Disable Scripts

**Description:** As a user, I want to toggle a script on or off so that I can temporarily disable it without deleting it.

**Acceptance Criteria:**

- [ ] Each script entry has a visible toggle switch (enabled/disabled)
- [ ] Disabled scripts are NOT injected into matching pages
- [ ] Toggle state is persisted in Chrome storage
- [ ] Visual distinction between enabled and disabled scripts (e.g., dimmed row)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-005: Configure Injection Timing

**Description:** As a user, I want to configure when my script runs after page load so that I can target dynamically loaded content.

**Acceptance Criteria:**

- [ ] Each script entry has a "Delay (ms)" field, defaulting to `0`
- [ ] The delay specifies milliseconds to wait after `DOMContentLoaded` before injection
- [ ] Setting delay to `0` means inject immediately after page load
- [ ] Delay value is validated (non-negative integer)
- [ ] Typecheck/lint passes

---

### US-006: Delete a Script

**Description:** As a user, I want to delete a script I no longer need so that my list stays clean.

**Acceptance Criteria:**

- [ ] Each script entry has a "Delete" button/icon
- [ ] Clicking delete shows a confirmation dialog before removing
- [ ] Deleted scripts are removed from Chrome storage
- [ ] UI updates immediately after deletion
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-007: Extension Popup — Script List Overview

**Description:** As a user, I want to see a quick overview of all my scripts in the extension popup so that I can manage them without opening a full page.

**Acceptance Criteria:**

- [ ] Extension popup shows a list of all scripts with: name, type (CSS/JS badge), URL pattern preview, and enable/disable toggle
- [ ] Each entry is clickable to navigate to the full editor (opens options page)
- [ ] Popup has a "New Script" button at the top
- [ ] Popup has a global enable/disable toggle for the entire extension
- [ ] Clicking the "Settings" / gear icon opens a **new full desktop tab** (`chrome.tabs.create`) to the options page — no small popup settings panel
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-008: Inject CSS into Matching Pages

**Description:** As a user, I want my enabled CSS scripts to be automatically injected into pages that match the URL pattern.

**Acceptance Criteria:**

- [ ] When a page loads, the extension checks all enabled CSS scripts for URL pattern matches
- [ ] Matching CSS is injected as a `<style>` element into the page
- [ ] CSS is injected after the configured delay (ms)
- [ ] Injected styles override existing page styles (use appropriate specificity or `!important` as needed)
- [ ] Typecheck/lint passes

---

### US-009: Inject JS into Matching Pages

**Description:** As a user, I want my enabled JS scripts to be automatically executed on pages that match the URL pattern.

**Acceptance Criteria:**

- [ ] When a page loads, the extension checks all enabled JS scripts for URL pattern matches
- [ ] Matching JS is executed in the page's context
- [ ] JS is executed after the configured delay (ms)
- [ ] Errors in user JS are caught and logged to the console (do not break page)
- [ ] Typecheck/lint passes

---

### US-010: Import/Export Scripts

**Description:** As a user, I want to export my scripts as a JSON file and import them back so that I can back up or share my configurations.

**Acceptance Criteria:**

- [ ] Options page has "Export All" button that downloads a JSON file
- [ ] Options page has "Import" button that accepts a JSON file
- [ ] Import merges with existing scripts (or replaces, with user choice)
- [ ] Invalid JSON shows an error message
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- **FR-1:** The extension must use Chrome Manifest V3 APIs
- **FR-2:** Each script entry stores: `id`, `name`, `type` (css | js), `code`, `urlPatterns` (array of glob strings), `enabled` (boolean), `delayMs` (number, default 0), `createdAt`, `updatedAt`
- **FR-3:** URL pattern matching must support glob/wildcard syntax using `*` as a wildcard character (matching any sequence of characters)
- **FR-4:** CSS injection must use the `chrome.scripting.insertCSS` API or inject via content script with a `<style>` tag
- **FR-5:** JS injection must use the `chrome.scripting.executeScript` API or inject via content script
- **FR-6:** All script data must be persisted in `chrome.storage.sync` (with fallback to `chrome.storage.local` for large data)
- **FR-7:** The code editor must provide syntax highlighting for both CSS and JavaScript (use CodeMirror 6 or Monaco Editor)
- **FR-8:** The extension popup must load in under 200ms and list all scripts
- **FR-9:** The extension must listen to `chrome.tabs.onUpdated` to detect page navigation and trigger injection
- **FR-10:** The global enable/disable toggle must immediately stop all injections when disabled
- **FR-11:** The extension icon badge should indicate the number of active scripts on the current page

## Non-Goals

- No support for regex URL patterns (only glob/wildcard)
- No cloud sync or account system (relies on Chrome's built-in sync)
- No script marketplace or sharing platform
- No support for injecting into `chrome://` or extension pages
- No built-in CSS/JS preprocessors (SCSS, TypeScript, etc.)
- No version history or undo for script edits
- No Firefox or other browser support (Chrome-only for now)

## Design Considerations

- **Design Philosophy:** Minimal and clean — avoid visual clutter. Every element should have a clear purpose.
- **Border Radius:** Use `rounded-md` (6px) consistently across all interactive elements (buttons, cards, inputs, badges, dialogs).
- **Primary Color:** `#02abff` — used for primary buttons, active states, links, focused inputs, and accent highlights.
- **Target Platform:** Desktop only. No mobile-responsive layouts — optimize for wide-screen usage.
- **Popup UI:** Compact list view with toggle switches, badges (CSS/JS), and a "+" button. Dark theme preferred. Settings icon opens a full desktop tab (not a small popup).
- **Options/Editor Page:** Full-page layout opened in a new tab. Sidebar for script list, main panel for the code editor. Split-pane layout.
- **Code Editor:** Use [CodeMirror 6](https://codemirror.net/6/) for the editor — it's lightweight, extensible, and well-suited for browser extensions. Monaco is an alternative but heavier.
- **Color Scheme:** Dark mode by default with a modern, minimal aesthetic. Use accent colors to distinguish CSS (blue/cyan) and JS (yellow/amber) scripts.
- **Icons:** Use [Lucide React](https://lucide.dev/) icons for all actions (edit, delete, toggle, add, settings). Consistent stroke width and sizing.
- **Component Library:** Use [shadcn/ui](https://ui.shadcn.com/) components as the building blocks — Button, Switch, Badge, Dialog, Input, Card, etc. Customize with the primary color and `rounded-md` radius.

## Technical Considerations

- **Node.js:** v22.22.2 — ensure all dev dependencies are compatible.
- **Manifest V3:** Must use Manifest V3 (service workers, `chrome.scripting` API). No background pages.
- **Next.js Static Export:** The options page uses Next.js in static export mode (`output: 'export'`). This generates plain HTML/CSS/JS that can be loaded as an extension page — no server runtime needed.
- **TailwindCSS:** Configure `tailwind.config.ts` with the primary color `#02abff` and default border-radius `rounded-md`. Use TailwindCSS utility classes for all styling.
- **shadcn/ui:** Install and configure shadcn/ui components. Override the default theme in `globals.css` to use `#02abff` as the primary color.
- **Content Security Policy:** The extension's own pages can use inline scripts, but injecting JS into web pages requires `chrome.scripting.executeScript` with `func` or `files` parameter.
- **Storage Limits:** `chrome.storage.sync` has a 100KB total limit and 8KB per-item limit. For users with many/large scripts, implement fallback to `chrome.storage.local` (5MB limit).
- **Glob Matching:** Implement a simple glob-to-regex converter for URL pattern matching, or use Chrome's built-in `chrome.runtime.getURL` pattern matching.
- **Performance:** Injection logic runs on every page load — keep it fast. Cache compiled regex patterns.
- **Build Tool:** Use Vite for bundling the extension (popup, options page, background service worker, content scripts).
- **TypeScript:** Strict mode enabled. All source files in `.ts` / `.tsx`.
- **Project Structure:**
  ```
  kw-browser-extensions/
  ├── src/
  │   ├── background/        # Service worker (plain TS, no React)
  │   ├── content/           # Content scripts (plain TS, no React)
  │   ├── popup/             # Popup UI (Next.js + shadcn/ui)
  │   ├── options/           # Options/editor page (Next.js + shadcn/ui)
  │   ├── components/        # Shared React components (shadcn/ui based)
  │   ├── lib/               # Shared utilities, types, storage helpers
  │   └── assets/            # Icons, images
  ├── public/
  │   └── manifest.json
  ├── tailwind.config.ts
  ├── tsconfig.json
  ├── package.json
  └── vite.config.ts
  ```

## Success Metrics

- User can create a new CSS/JS script and see it applied on a matching page within 30 seconds of setup
- Scripts persist across browser sessions and Chrome sync
- Enable/disable toggle takes effect on the next page load (no browser restart required)
- Code editor loads with syntax highlighting in under 500ms
- Extension popup opens and displays script list in under 200ms

## Open Questions

1. Should we support multiple URL patterns per script entry, or should each script have exactly one URL pattern?
   - *Current assumption: multiple patterns per script (comma-separated or one per line)*
2. Should the code editor support multiple tabs (edit several scripts side by side)?
   - *Current assumption: single editor view, switch between scripts via sidebar*
3. Should there be a "Run once" / "Test" button to manually execute a script on the current page without saving?
   - *Could be useful for debugging — deferred to v2*
4. Should `chrome.storage.sync` be the default, or should we default to `chrome.storage.local` for simplicity and higher storage limits?
