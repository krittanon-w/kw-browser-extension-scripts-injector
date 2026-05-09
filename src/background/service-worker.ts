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
  if (changeInfo.status === 'complete' && tab.url) {
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
      const delay = script.delayMs || 0;
      if (delay > 0) {
        setTimeout(() => inject(tabId, script), delay);
      } else {
        inject(tabId, script);
      }
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
    if (script.cssCode) {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: script.cssCode,
      });
    }
    if (script.jsCode) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (code: string) => {
          try {
            // Use a function to avoid global scope pollution and catch errors
            new Function(code)();
          } catch (e) {
            console.error('Error in injected script:', e);
          }
        },
        args: [script.jsCode],
      });
    }
  } catch (err: any) {
    const identifier = script.name || script.urlPatterns[0] || 'Untitled Script';
    console.error(`Failed to inject script "${identifier}":`, err);
    // Don't spam notifications on every page load failure (e.g. restricted pages)
    // notifyError(`Failed to inject script "${identifier}": ${err.message}`);
  }
}
