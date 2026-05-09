import type { ExtensionState, ScriptEntry } from './types';

const STORAGE_KEY = 'css_js_injector_state';

const DEFAULT_STATE: ExtensionState = {
  globalEnabled: true,
  scripts: [],
};

/**
 * Gets the entire extension state from storage.
 * Tries sync storage first, then local.
 */
export async function getAll(): Promise<ExtensionState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (syncResult) => {
      const syncData = syncResult[STORAGE_KEY] as ExtensionState | undefined;
      if (syncData) {
        resolve(syncData);
      } else {
        chrome.storage.local.get([STORAGE_KEY], (localResult) => {
          const localData = localResult[STORAGE_KEY] as ExtensionState | undefined;
          resolve(localData || DEFAULT_STATE);
        });
      }
    });
  });
}

/**
 * Saves the entire extension state to storage.
 * Tries sync storage first, falls back to local if quota is exceeded.
 */
export async function saveAll(state: ExtensionState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Sync storage failed, falling back to local storage:', chrome.runtime.lastError.message);
        chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } else {
        // Clear local storage if sync succeeded to avoid stale data
        chrome.storage.local.remove(STORAGE_KEY);
        resolve();
      }
    });
  });
}

export async function addScript(script: ScriptEntry): Promise<void> {
  const state = await getAll();
  state.scripts.push(script);
  await saveAll(state);
}

export async function updateScript(id: string, updates: Partial<ScriptEntry>): Promise<void> {
  const state = await getAll();
  const index = state.scripts.findIndex((s) => s.id === id);
  if (index !== -1) {
    state.scripts[index] = { ...state.scripts[index], ...updates, updatedAt: Date.now() };
    await saveAll(state);
  }
}

export async function deleteScript(id: string): Promise<void> {
  const state = await getAll();
  state.scripts = state.scripts.filter((s) => s.id !== id);
  await saveAll(state);
}

export async function getGlobalEnabled(): Promise<boolean> {
  const state = await getAll();
  return state.globalEnabled;
}

export async function setGlobalEnabled(enabled: boolean): Promise<void> {
  const state = await getAll();
  state.globalEnabled = enabled;
  await saveAll(state);
}
