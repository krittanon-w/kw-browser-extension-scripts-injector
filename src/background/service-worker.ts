import { getAll } from '../lib/storage';
import { matchesUrl } from '../lib/url-matcher';

console.log('Background service worker loaded');

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    const state = await getAll();
    
    // Check global toggle
    if (!state.globalEnabled) return;

    for (const script of state.scripts) {
      if (script.enabled && matchesUrl(tab.url, script.urlPatterns)) {
        console.log(`Injecting script "${script.name}" into ${tab.url}`);
        
        // Handle delay
        if (script.delayMs > 0) {
          setTimeout(() => inject(tabId, script), script.delayMs);
        } else {
          inject(tabId, script);
        }
      }
    }
  }
});

async function inject(tabId: number, script: any) {
  try {
    if (script.type === 'css') {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: script.code,
      });
    } else if (script.type === 'js') {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (code: string) => {
          try {
            new Function(code)();
          } catch (e) {
            console.error('Error in injected script:', e);
          }
        },
        args: [script.code],
      });
    }
  } catch (err) {
    console.error(`Failed to inject script "${script.name}":`, err);
  }
}
