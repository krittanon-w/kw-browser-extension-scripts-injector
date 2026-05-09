# Scripts Injector - User Guide

Welcome to the **Scripts Injector** user guide. This document provides detailed instructions on how to configure and use the extension to customize your web experience with custom CSS and JavaScript.

---

## 🚀 Getting Started

Scripts Injector allows you to "inject" your own code into specific websites. You can change how a site looks (CSS) or how it behaves (JavaScript).

### 1. Global Enable/Disable
At the top right of the Options page, you'll find a master switch. 
- **Enabled**: All your active script injectors will run on their matched pages.
- **Disabled**: No scripts will be injected, regardless of individual settings. This is useful for quickly troubleshooting if a site is breaking.

### 2. Creating an Injector
Click the **"New Injector"** button in the sidebar to create a new configuration. Each injector is a self-contained set of rules (URL patterns, CSS, and JS).

---

## 🛠️ Configuring Your Injector

When you select an injector from the sidebar, you can configure the following fields:

### 🌐 URL Patterns
This is the most critical part. It tells the extension **where** to run your code. You can provide multiple patterns (one per line).

**Syntax:**
The extension uses simple "Glob" patterns where the asterisk (`*`) acts as a wildcard.

| Pattern | Matches |
| :--- | :--- |
| `*` | Matches **every** URL (use with caution!) |
| `*://*.google.com/*` | Matches any page on any Google subdomain (e.g., `news.google.com`, `mail.google.com`) |
| `https://www.facebook.com/*` | Matches any page on Facebook, but only over HTTPS. |
| `*://example.com/settings/*` | Matches only the settings pages on example.com. |

> [!TIP]
> Always use `*` at the end of your pattern (e.g., `*/path/*`) if you want it to match all sub-pages and query parameters.

### 🧪 Test URL Matching
Before navigating to the site, you can verify your patterns here. 
1. Enter a real URL (e.g., `https://www.google.com/search?q=test`) into the test box.
2. The indicator will show **MATCH** (Green) or **NO MATCH** (Red) based on your current URL patterns.

### ⏱️ Injection Delay (ms)
Some websites load their content dynamically (using React, Vue, etc.). If your script runs too early, the elements you want to modify might not exist yet.
- **Default**: 500ms.
- **Increase this** if your script isn't finding elements on the page.
- **Set to 0** for instant execution (best for CSS).

---

## 💻 Writing Code

### 🎨 Custom CSS
Used to change the visual style of a page.
- **Example**: Hide an annoying sidebar.
  ```css
  .sidebar-ads {
    display: none !important;
  }
  ```
- **Note**: CSS is injected into the page's head. Using `!important` is often helpful to override the site's default styles.

### 📜 Custom JavaScript
Used to add functionality or modify page behavior.
- **Execution Context**: Scripts run in the **MAIN** world. This means your code can access the site's own variables and functions (like `window.myApp`).
- **Trusted Types**: If a site has a strict security policy (CSP), the extension automatically handles "Trusted Types" to ensure your script can still execute safely.
- **Example**: Log a message when the page loads.
  ```javascript
  console.log("Hello from Scripts Injector!");
  document.body.style.border = "5px solid red";
  ```

---

## 📂 Data Management

### Import & Export
You can backup your configurations or share them with others.
- **Export**: Downloads a `.json` file containing all your injectors and settings.
- **Import**: Allows you to upload a previously exported `.json` file.
  - **Merge**: Adds new injectors to your current list.
  - **Replace All**: Deletes all current injectors and replaces them with the ones from the file.

---

## ❓ Troubleshooting

### My script isn't working!
1. **Check the Global Switch**: Is the extension enabled globally?
2. **Check the Pattern**: Use the "Test URL Matching" tool to ensure the URL is actually matched.
3. **Check the Console**: Open the browser's Developer Tools (`F12` or `Ctrl+Shift+I`) and look for errors in the "Console" tab.
4. **Increase Delay**: The script might be running before the page is ready. Try increasing the **Injection Delay** to 2000ms.
5. **CSP Restrictions**: Some extremely high-security sites (like banking sites) may block all external scripts. Check the console for "Content Security Policy" errors.

### The CSS doesn't apply!
- Try adding `!important` to your CSS rules.
- Ensure the selector you are using is correct by inspecting the page elements.

---

*For more technical details, visit the [GitHub Repository](https://github.com/krittanon-w/kw-browser-extension-scripts-injector).*
