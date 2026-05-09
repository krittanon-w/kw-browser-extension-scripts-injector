export interface ScriptEntry {
  id: string;
  name: string;
  cssCode: string;
  jsCode: string;
  urlPatterns: string[];
  enabled: boolean;
  delayMs: number;
  testUrls?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ExtensionState {
  globalEnabled: boolean;
  scripts: ScriptEntry[];
}
