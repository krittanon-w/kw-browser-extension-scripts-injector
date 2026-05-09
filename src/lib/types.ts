export interface ScriptEntry {
  id: string;
  cssCode: string;
  jsCode: string;
  urlPatterns: string[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ExtensionState {
  globalEnabled: boolean;
  scripts: ScriptEntry[];
}
