import { getAll } from '../lib/storage';
import { matchesUrl } from '../lib/url-matcher';
import { notifyError } from '../lib/notifications';
import type { ScriptEntry } from '../lib/types';

console.log('Background service worker loaded');

const GLOBAL_DELAY_MS = 500;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await orchestrateInjection(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await updateBadge(activeInfo.tabId, tab.url);
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.storage.onChanged.addListener(async () => {
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
    if (script.enabled && matchesUrl(url, script.urlPatterns)) {
      activeCount++;
      // Apply global delay
      setTimeout(() => inject(tabId, script), GLOBAL_DELAY_MS);
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

  const activeCount = state.scripts.filter(s => s.enabled && matchesUrl(url, s.urlPatterns)).length;
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
            new Function(code)();
          } catch (e) {
            console.error('Error in injected script:', e);
          }
        },
        args: [script.jsCode],
      });
    }
  } catch (err: any) {
    const identifier = script.urlPatterns[0] || 'Untitled Script';
    console.error(`Failed to inject script "${identifier}":`, err);
    notifyError(`Failed to inject script "${identifier}": ${err.message}`);
  }
}
