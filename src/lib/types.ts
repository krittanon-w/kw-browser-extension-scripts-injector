export interface ScriptEntry {
  id: string;
  name: string;
  type: 'css' | 'js';
  code: string;
  urlPatterns: string[];
  enabled: boolean;
  delayMs: number;
  createdAt: number;
  updatedAt: number;
}

export interface ExtensionState {
  globalEnabled: boolean;
  scripts: ScriptEntry[];
}
