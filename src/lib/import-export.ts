import type { ExtensionState } from './types';
import { saveAll } from './storage';

export function exportData(state: ExtensionState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `css-js-injector-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File, mode: 'merge' | 'replace', currentState: ExtensionState): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as ExtensionState;
        
        // Basic validation
        if (typeof imported.globalEnabled !== 'boolean' || !Array.isArray(imported.scripts)) {
          throw new Error('Invalid backup file format.');
        }

        let newState: ExtensionState;
        if (mode === 'replace') {
          newState = imported;
        } else {
          // Merge: add scripts from imported if they don't exist (by ID or name/type/pattern combo)
          const existingIds = new Set(currentState.scripts.map(s => s.id));
          const newScripts = imported.scripts.filter(s => !existingIds.has(s.id));
          newState = {
            ...currentState,
            scripts: [...currentState.scripts, ...newScripts]
          };
        }

        await saveAll(newState);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
