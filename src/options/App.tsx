import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Settings,
  Trash2,
  ExternalLink,
  Code2,
  FileCode2,
  Check,
  AlertCircle,
  Clock,
  Layout,
  Download,
  Upload,
} from "lucide-react";
import {
  getAll,
  addScript,
  updateScript,
  deleteScript,
  setGlobalEnabled,
} from "../lib/storage";
import type { ExtensionState, ScriptEntry } from "../lib/types";
import { CodeEditor } from "../components/CodeEditor";
import { exportData, importData } from "../lib/import-export";
import { matchesUrl } from "../lib/url-matcher";
import { Switch } from "../components/ui/Switch";
import { ToastProvider, toast } from "../components/ui/Toast";
import { useConfirmDialog } from "../components/ui/ConfirmDialog";
import { cn } from "../components/ui/cn";

function App() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState("");
  const { confirm, element: confirmDialog } = useConfirmDialog();

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const s = await getAll();
    setState(s);
    if (!activeId && s.scripts.length > 0) {
      setActiveId(s.scripts[0].id);
    }
  }

  const filteredScripts = useMemo(() => {
    if (!state) return [];
    const query = search.toLowerCase();
    return state.scripts.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.urlPatterns.some((p) => p.toLowerCase().includes(query))
    );
  }, [state, search]);

  const activeScript = useMemo(() => {
    return state?.scripts.find((s) => s.id === activeId) || null;
  }, [state, activeId]);

  async function handleAdd() {
    const script: ScriptEntry = {
      id: crypto.randomUUID(),
      name: "", // We'll derive it from patterns now
      cssCode: "/* Add your CSS here */",
      jsCode: "// Add your JavaScript here",
      urlPatterns: ["*://example.com/*"],
      enabled: true,
      delayMs: 500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addScript(script);
    setActiveId(script.id);
    loadState();
    toast("New injector created", "success");
  }

  async function handleUpdate(id: string, updates: Partial<ScriptEntry>) {
    await updateScript(id, updates);
    loadState();
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete Injector?",
      message: "This action cannot be undone. All code for this injector will be lost.",
      danger: true,
      confirmLabel: "Delete permanently",
    });
    if (ok) {
      await deleteScript(id);
      if (activeId === id) {
        setActiveId(state?.scripts.find((s) => s.id !== id)?.id || null);
      }
      loadState();
      toast("Injector deleted", "info");
    }
  }

  async function handleToggleGlobal() {
    if (!state) return;
    const next = !state.globalEnabled;
    await setGlobalEnabled(next);
    loadState();
    toast(next ? "Extension enabled" : "Extension disabled", "info");
  }

  const isMatch = useMemo(() => {
    if (!testUrl || !activeScript) return null;
    return matchesUrl(testUrl, activeScript.urlPatterns);
  }, [testUrl, activeScript]);

  if (!state) return null;

  return (
    <div className="options-layout">
      <ToastProvider />
      {confirmDialog}

      {/* Header */}
      <header className="options-header">
        <div className="options-header-title">
          <Layout className="options-header-logo" size={20} />
          <span>CSS & JS Injector</span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn("global-toggle-pill", state.globalEnabled && "on")}
            onClick={handleToggleGlobal}
          >
            <div className="w-2 h-2 rounded-full bg-current" />
            <span>{state.globalEnabled ? "Active" : "Paused"}</span>
          </div>
          <button className="btn-icon">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="options-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-search">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={14}
              />
              <input
                type="text"
                className="input pl-9 h-9"
                placeholder="Search patterns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-list">
            <div className="divider-label px-2 mt-2 mb-1">Your Injectors</div>
            {filteredScripts.map((s) => (
              <button
                key={s.id}
                className={cn(
                  "sidebar-item sidebar-item-anim",
                  activeId === s.id && "active",
                  !s.enabled && "disabled-item"
                )}
                onClick={() => setActiveId(s.id)}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    s.enabled ? "bg-primary" : "bg-text-muted"
                  )}
                />
                <span className="sidebar-item-name">{s.urlPatterns[0] || "No pattern"}</span>
                {s.cssCode && s.cssCode.trim() !== "/* Add your CSS here */" && (
                  <span className="text-[10px] text-css font-bold opacity-70">CSS</span>
                )}
                {s.jsCode && s.jsCode.trim() !== "// Add your JavaScript here" && (
                  <span className="text-[10px] text-js font-bold opacity-70">JS</span>
                )}
              </button>
            ))}
            {filteredScripts.length === 0 && (
              <div className="text-center py-8 text-text-muted text-xs">
                No results found
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <button className="btn btn-primary w-full justify-center" onClick={handleAdd}>
              <Plus size={16} />
              <span>New Injector</span>
            </button>
            
            <div className="flex gap-2">
              <button 
                className="btn btn-ghost flex-1 justify-center px-0" 
                title="Export JSON"
                onClick={() => exportData(state)}
              >
                <Download size={14} />
              </button>
              <label className="btn btn-ghost flex-1 justify-center px-0 cursor-pointer" title="Import JSON">
                <Upload size={14} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const mode = await confirm({
                      title: "Import Data",
                      message: "Merge with existing or replace all?",
                      confirmLabel: "Merge",
                      cancelLabel: "Replace All",
                    }) ? 'merge' : 'replace';
                    try {
                      await importData(file, mode, state);
                      loadState();
                      toast("Import successful", "success");
                    } catch (err: any) {
                      toast(`Import failed: ${err.message}`, "error");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="main-panel">
          {activeScript ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="text-text-hi font-semibold text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                    {activeScript.urlPatterns[0] || "No URL Pattern"}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-2">
                    <Clock size={12} />
                    <span>Last updated: {new Date(activeScript.updatedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    label={activeScript.enabled ? "Active" : "Disabled"}
                    checked={activeScript.enabled}
                    onChange={(e) => handleUpdate(activeScript.id, { enabled: e.target.checked })}
                  />
                  <div className="w-[1px] h-6 bg-border mx-1" />
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(activeScript.id)}
                    title="Delete Injector"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="sep" />

              {/* URL Patterns */}
              <div className="field-group">
                <div className="flex items-center justify-between">
                  <label className="field-label">URL Patterns</label>
                  <a 
                    href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/" 
                    target="_blank" 
                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                  >
                    View Syntax <ExternalLink size={10} />
                  </a>
                </div>
                <textarea
                  className="input font-mono text-xs min-h-[60px]"
                  placeholder="e.g. *://*.google.com/*"
                  value={activeScript.urlPatterns.join("\n")}
                  onChange={(e) =>
                    handleUpdate(activeScript.id, {
                      urlPatterns: e.target.value.split("\n").filter(p => p.trim()),
                    })
                  }
                />
                
                {/* Test URL */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                    <input
                      className="input pl-8 h-8 text-xs"
                      placeholder="Test matching URL..."
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                    />
                  </div>
                  {testUrl && (
                    <div className={cn("match-result", isMatch ? "match" : "no-match")}>
                      {isMatch ? <Check size={12} /> : <AlertCircle size={12} />}
                      <span>{isMatch ? "Matches" : "No match"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delay */}
              <div className="field-group w-48">
                <label className="field-label">Injection Delay (ms)</label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input
                    type="number"
                    className="input pl-9 h-9"
                    min="0"
                    step="50"
                    value={activeScript.delayMs}
                    onChange={(e) => handleUpdate(activeScript.id, { delayMs: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Editors */}
              <div className="grid grid-cols-1 gap-6 mt-2">
                <div className="editor-section">
                  <div className="editor-section-header">
                    <FileCode2 className="text-css" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-css">Custom CSS</span>
                  </div>
                  <div className="card border-css/30">
                    <CodeEditor
                      value={activeScript.cssCode}
                      language="css"
                      onChange={(cssCode) => handleUpdate(activeScript.id, { cssCode })}
                    />
                  </div>
                </div>

                <div className="editor-section">
                  <div className="editor-section-header">
                    <Code2 className="text-js" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-js">Custom JavaScript</span>
                  </div>
                  <div className="card border-js/30">
                    <CodeEditor
                      value={activeScript.jsCode}
                      language="js"
                      onChange={(jsCode) => handleUpdate(activeScript.id, { jsCode })}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="p-6 rounded-full bg-surface-3 mb-4">
                <Layout className="empty-state-icon" />
              </div>
              <h2>Select or create an injector</h2>
              <p className="max-w-[280px]">
                Create a new injector to start customizing your favorite websites with CSS and JS.
              </p>
              <button className="btn btn-primary mt-4" onClick={handleAdd}>
                <Plus size={16} />
                <span>Create First Injector</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
