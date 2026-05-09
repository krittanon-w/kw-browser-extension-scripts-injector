import { getAll } from '../lib/storage';
import { globToRegex } from '../lib/url-matcher';
import type { ScriptEntry } from '../lib/types';

console.log('Background service worker loaded');

// Performance Tuning: Cache compiled regex patterns
const regexCache = new Map<string, RegExp>();

function getCachedRegex(pattern: string): RegExp {
  const trimmed = pattern.trim();
  let regex = regexCache.get(trimmed);
  if (!regex) {
    regex = globToRegex(trimmed);
    regexCache.set(trimmed, regex);
  }
  return regex;
}

// Optimized matchesUrl using cache
function matchesUrlOptimized(url: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((pattern) => {
    try {
      const regex = getCachedRegex(pattern);
      return regex.test(url);
    } catch (e) {
      return false;
    }
  });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Status 'complete' is the standard trigger.
  // We also check for changeInfo.url to handle SPA navigation where status might not change to complete.
  if (tab.url && (changeInfo.status === 'complete' || changeInfo.url)) {
    await orchestrateInjection(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await updateBadge(activeInfo.tabId, tab.url);
    }
  } catch (e) {
    // Tab might be closed
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.storage.onChanged.addListener(async () => {
  // Clear cache when storage changes to ensure patterns are up to date
  regexCache.clear();
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id && tab.url) {
    await updateBadge(tab.id, tab.url);
  }
});

async function orchestrateInjection(tabId: number, url: string) {
  // Skip internal browser pages
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('view-source:')) {
    return;
  }

  const state = await getAll();
  let activeCount = 0;
  
  if (!state.globalEnabled) {
    chrome.action.setBadgeText({ tabId, text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#666' });
    return;
  }

  for (const script of state.scripts) {
    if (script.enabled && matchesUrlOptimized(url, script.urlPatterns)) {
      activeCount++;
      // Kick off injection; it handles its own delay internal to the tab
      inject(tabId, script);
    }
  }

  updateBadgeWithCount(tabId, activeCount);
}

async function updateBadge(tabId: number, url: string) {
  const state = await getAll();
  if (!state.globalEnabled) {
    chrome.action.setBadgeText({ tabId, text: 'OFF' });
    return;
  }

  const activeCount = state.scripts.filter(s => s.enabled && matchesUrlOptimized(url, s.urlPatterns)).length;
  updateBadgeWithCount(tabId, activeCount);
}

function updateBadgeWithCount(tabId: number, count: number) {
  const text = count > 0 ? count.toString() : '';
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#02abff' });
}

async function inject(tabId: number, script: ScriptEntry) {
  try {
    const { cssCode, jsCode, delayMs = 0 } = script;
    const identifier = script.name || (script.urlPatterns && script.urlPatterns[0]) || 'Untitled Script';

    // 1. Inject CSS
    if (cssCode) {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: cssCode,
      });
    }

    // 2. Inject JS
    if (jsCode) {
      await chrome.scripting.executeScript({
        target: { tabId },
        // Use ISOLATED world by default to bypass page CSP for eval/new Function
        // This is safer for DOM manipulation.
        world: 'ISOLATED', 
        func: (code: string, delay: number, scriptName: string) => {
          const run = () => {
            try {
              // Using a simple function wrapper for the user code
              const fn = new Function(code);
              fn();
            } catch (e) {
              console.error(`[Injector] Error in script "${scriptName}":`, e);
            }
          };

          if (delay > 0) {
            setTimeout(run, delay);
          } else {
            run();
          }
        },
        args: [jsCode, delayMs, identifier],
      });
    }
  } catch (err: any) {
    const identifier = script.name || (script.urlPatterns && script.urlPatterns[0]) || 'Untitled Script';
    console.error(`[Injector] Failed to inject "${identifier}":`, err.message);
  }
}
