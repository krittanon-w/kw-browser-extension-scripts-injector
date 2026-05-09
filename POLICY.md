# Privacy Policy — Scripts Injector

**Extension Name:** Scripts Injector  
**Author:** krittanon-w  
**Last Updated:** May 10, 2026  

---

## Overview

Scripts Injector is a browser extension that allows users to inject custom CSS and JavaScript into any website based on user-defined URL pattern rules. This policy describes how the extension collects, uses, and shares any data related to its use.

---

## 1. Data Collection

Scripts Injector **does not collect any personal data**.

The extension only stores data that is **explicitly created by the user**, specifically:

- URL pattern rules (e.g., `https://example.com/*`)
- Custom CSS snippets associated with each rule
- Custom JavaScript snippets associated with each rule
- Rule metadata (e.g., rule name, enabled/disabled state)

No browsing history, page content, personally identifiable information (PII), or any other form of user data is collected, read, or recorded by this extension.

---

## 2. Data Storage

All user-created data (rules, scripts, settings) is stored **exclusively on the user's local device** using the browser's built-in `chrome.storage.local` API.

- Data **never leaves the user's device**.
- Data is **not transmitted** to any external server, cloud service, or third party.
- Data is **not synced** across devices (i.e., `chrome.storage.sync` is not used).

---

## 3. Data Usage

The stored data (URL patterns, CSS, and JS snippets) is used solely for the following purpose:

> To inject the user's custom CSS and JavaScript into web pages whose URLs match the user-configured patterns, using `chrome.scripting.insertCSS` and `chrome.scripting.executeScript`.

The extension uses the `tabs` permission to detect page navigation events and determine whether the active page URL matches any user-configured rule. **The extension does not read, store, or transmit the content of any web page.**

---

## 4. Data Sharing

Scripts Injector **does not share any data with any third parties**.

- No analytics platforms
- No advertising networks
- No cloud or remote services
- No external APIs

All operations are performed entirely **locally within the user's browser**.

---

## 5. Remote Code Execution

Scripts Injector **does not load or execute any remote code**.

All JavaScript and CSS that is injected into web pages is:

- Written directly by the user inside the extension's options page
- Stored locally in `chrome.storage.local`
- Injected at runtime from local storage only

No scripts are fetched from external URLs or third-party servers.

---

## 6. Permissions Used

| Permission | Purpose |
|---|---|
| `storage` | Save and retrieve user-defined injection rules locally on the device |
| `scripting` | Inject user-defined CSS and JS into matching web pages |
| `tabs` | Detect page navigation to trigger injection rules based on the tab's URL |
| `host_permissions` (`<all_urls>`) | Required to inject scripts into any URL that the user configures as a target |

---

## 7. Children's Privacy

This extension is not directed at children under the age of 13 and does not knowingly collect any information from children.

---

## 8. Changes to This Policy

If this privacy policy is updated, the new version will be published in this repository with an updated **Last Updated** date. Continued use of the extension after any changes constitutes acceptance of the updated policy.

---

## 9. Contact

If you have any questions or concerns about this privacy policy, please open an issue at:

**https://github.com/krittanon-w/kw-browser-extension-scripts-injector/issues**
