import { useState, useEffect, useMemo } from "react";
import {
  Plus,
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
  X,
} from "lucide-react";
import { getAll } from "../lib/storage";
import type { ExtensionState, ScriptEntry } from "../lib/types";
import { CodeEditor } from "../components/CodeEditor";
import { exportData, importData } from "../lib/import-export";
import { matchesUrl } from "../lib/url-matcher";
import { Switch } from "../components/ui/Switch";
import { ToastProvider, toast } from "../components/ui/Toast";
import { useConfirmDialog } from "../components/ui/ConfirmDialog";
import { cn } from "../components/ui/cn";
import { formatRelativeTime, formatDateTime } from "../lib/date-utils";

function App() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { confirm, element: confirmDialog } = useConfirmDialog();

  useEffect(() => {
    loadInitialState();
  }, []);

  async function loadInitialState() {
    const s = await getAll();
    setState(s);
    if (!activeId && s.scripts.length > 0) {
      setActiveId(s.scripts[0].id);
    }
  }

  // Debounced save to storage
  useEffect(() => {
    if (!state) return;
    const timer = setTimeout(() => {
      // We don't want to loadState after save here to avoid resetting the cursor in editors
      import("../lib/storage").then((lib) => lib.saveAll(state));
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const groupedScripts = useMemo(() => {
    if (!state) return { enabled: [], disabled: [] };
    const query = search.toLowerCase();
    const filtered = state.scripts.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.urlPatterns.some((p) => p.toLowerCase().includes(query)),
    );

    const sorted = [...filtered].sort((a, b) => {
      const nameA = (a.urlPatterns[0] || "").toLowerCase();
      const nameB = (b.urlPatterns[0] || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return {
      enabled: sorted.filter((s) => s.enabled),
      disabled: sorted.filter((s) => !s.enabled),
    };
  }, [state, search]);

  const activeScript = useMemo(() => {
    return state?.scripts.find((s) => s.id === activeId) || null;
  }, [state, activeId]);

  async function handleAdd() {
    if (!state) return;
    const script: ScriptEntry = {
      id: crypto.randomUUID(),
      name: "",
      cssCode: "/* Add your CSS here */",
      jsCode: "// Add your JavaScript here",
      urlPatterns: ["*://example.com/*"],
      enabled: true,
      delayMs: 500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState({ ...state, scripts: [...state.scripts, script] });
    setActiveId(script.id);
    toast("New injector created", "success");
  }

  function handleUpdate(id: string, updates: Partial<ScriptEntry>) {
    if (!state) return;
    const newScripts = state.scripts.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s,
    );
    setState({ ...state, scripts: newScripts });
  }

  async function handleDelete(id: string) {
    if (!state) return;
    const ok = await confirm({
      title: "Delete Injector?",
      message:
        "This action cannot be undone. All code for this injector will be lost.",
      danger: true,
      confirmLabel: "Delete permanently",
    });
    if (ok) {
      const newScripts = state.scripts.filter((s) => s.id !== id);
      setState({ ...state, scripts: newScripts });
      if (activeId === id) {
        setActiveId(newScripts[0]?.id || null);
      }
      toast("Injector deleted", "info");
    }
  }

  async function handleToggleGlobal() {
    if (!state) return;
    const next = !state.globalEnabled;
    setState({ ...state, globalEnabled: next });
    toast(next ? "Extension enabled" : "Extension disabled", "info");
  }

  // We'll calculate match status per URL inside the render loop for clarity
  // since the user wants status "in the end" of each input box.

  if (!state) return null;

  const renderSidebarItem = (s: ScriptEntry) => (
    <button
      key={s.id}
      className={cn(
        "sidebar-item sidebar-item-anim",
        activeId === s.id && "active",
        !s.enabled && "disabled-item",
      )}
      onClick={() => setActiveId(s.id)}
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {s.enabled ? (
          <Check className="text-primary" size={14} strokeWidth={3} />
        ) : (
          <X className="text-danger" size={14} strokeWidth={3} />
        )}
      </div>
      <span className="sidebar-item-name">
        {s.urlPatterns[0] || "No pattern"}
      </span>
      {s.cssCode && s.cssCode.trim() !== "/* Add your CSS here */" && (
        <span className="text-[10px] text-css font-bold opacity-70">CSS</span>
      )}
      {s.jsCode && s.jsCode.trim() !== "// Add your JavaScript here" && (
        <span className="text-[10px] text-js font-bold opacity-70">JS</span>
      )}
    </button>
  );

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
            <span>
              {state.globalEnabled ? "Extension enabled" : "Extension disabled"}
            </span>
          </div>
        </div>
      </header>

      <div className="options-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-search">
            <input
              type="text"
              className="input h-9"
              placeholder="Search patterns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-list">
            {groupedScripts.enabled.length > 0 && (
              <>
                <div className="divider-label px-2 mt-2 mb-1">Active</div>
                {groupedScripts.enabled.map(renderSidebarItem)}
              </>
            )}

            {groupedScripts.disabled.length > 0 && (
              <>
                <div
                  className={cn(
                    "divider-label px-2 mt-4 mb-1",
                    groupedScripts.enabled.length === 0 && "mt-2",
                  )}
                >
                  Inactive
                </div>
                {groupedScripts.disabled.map(renderSidebarItem)}
              </>
            )}

            {groupedScripts.enabled.length === 0 &&
              groupedScripts.disabled.length === 0 && (
                <div className="text-center py-8 text-text-muted text-xs">
                  No results found
                </div>
              )}
          </div>

          <div className="sidebar-footer">
            <button
              className="btn btn-primary w-full justify-center"
              onClick={handleAdd}
            >
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
              <label
                className="btn btn-ghost flex-1 justify-center px-0 cursor-pointer"
                title="Import JSON"
              >
                <Upload size={14} />
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const mode = (await confirm({
                      title: "Import Data",
                      message: "Merge with existing or replace all?",
                      confirmLabel: "Merge",
                      cancelLabel: "Replace All",
                    }))
                      ? "merge"
                      : "replace";
                    try {
                      await importData(file, mode, state);
                      loadInitialState();
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
            <div className="main-content-wrapper">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="text-text-hi font-semibold text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                    {activeScript.urlPatterns[0] || "No URL Pattern"}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-2">
                    <Clock size={12} />
                    <span title={formatDateTime(activeScript.updatedAt)}>
                      Last updated: {formatRelativeTime(activeScript.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    label={activeScript.enabled ? "Active" : "Disabled"}
                    checked={activeScript.enabled}
                    onChange={(e) =>
                      handleUpdate(activeScript.id, {
                        enabled: e.target.checked,
                      })
                    }
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
                  disabled={!activeScript.enabled}
                  value={activeScript.urlPatterns.join("\n")}
                  onChange={(e) =>
                    handleUpdate(activeScript.id, {
                      urlPatterns: e.target.value
                        .split("\n")
                        .filter((p) => p.trim()),
                    })
                  }
                />

                {/* Test URLs - Dynamic List */}
                <div className="mt-4 flex flex-col gap-2">
                  <label className="field-label">Test URL Matching</label>
                  {(activeScript.testUrls || [""])
                    .concat(
                      (activeScript.testUrls?.length || 0) > 0 &&
                        activeScript.testUrls![
                          activeScript.testUrls!.length - 1
                        ].trim() !== ""
                        ? [""]
                        : [],
                    )
                    .map((url, idx) => {
                      const isMatch = url.trim()
                        ? matchesUrl(url, activeScript.urlPatterns)
                        : null;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            className="input h-9 text-xs font-mono flex-1"
                            placeholder="Enter URL to test..."
                            value={url}
                            onChange={(e) => {
                              const newUrls = [
                                ...(activeScript.testUrls || []),
                              ];
                              // Ensure the array is long enough
                              while (newUrls.length <= idx) newUrls.push("");
                              newUrls[idx] = e.target.value;
                              handleUpdate(activeScript.id, {
                                testUrls: newUrls,
                              });
                            }}
                          />
                          <div className="w-36 shrink-0">
                            {url.trim() && (
                              <div
                                className={cn(
                                  "match-result py-1 px-2 text-[10px] w-full justify-center",
                                  isMatch ? "match" : "no-match",
                                )}
                              >
                                {isMatch ? (
                                  <Check size={10} strokeWidth={3} />
                                ) : (
                                  <AlertCircle size={10} strokeWidth={3} />
                                )}
                                <span className="font-semibold uppercase tracking-tight">
                                  {isMatch ? "Match" : "No match"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="w-9 shrink-0 flex justify-center">
                            {idx < (activeScript.testUrls?.length || 0) && (
                              <button
                                className="btn-icon p-1 hover:text-danger"
                                onClick={() => {
                                  const newUrls = activeScript.testUrls!.filter(
                                    (_, i) => i !== idx,
                                  );
                                  handleUpdate(activeScript.id, {
                                    testUrls: newUrls,
                                  });
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Delay */}
              <div className="field-group w-48">
                <label className="field-label">Injection Delay (ms)</label>
                <input
                  type="number"
                  className="input h-9"
                  min="0"
                  step="50"
                  disabled={!activeScript.enabled}
                  value={activeScript.delayMs}
                  onChange={(e) =>
                    handleUpdate(activeScript.id, {
                      delayMs: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              {/* Editors */}
              <div className="grid grid-cols-1 gap-6 mt-2">
                <div className="editor-section">
                  <div className="editor-section-header">
                    <FileCode2 className="text-css" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-css">
                      Custom CSS
                    </span>
                  </div>
                  <div
                    className={cn(
                      "card border-css/30",
                      !activeScript.enabled && "opacity-50",
                    )}
                  >
                    <CodeEditor
                      value={activeScript.cssCode}
                      language="css"
                      readOnly={!activeScript.enabled}
                      onChange={(cssCode) =>
                        handleUpdate(activeScript.id, { cssCode })
                      }
                    />
                  </div>
                </div>

                <div className="editor-section">
                  <div className="editor-section-header">
                    <Code2 className="text-js" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-js">
                      Custom JavaScript
                    </span>
                  </div>
                  <div
                    className={cn(
                      "card border-js/30",
                      !activeScript.enabled && "opacity-50",
                    )}
                  >
                    <CodeEditor
                      value={activeScript.jsCode}
                      language="js"
                      readOnly={!activeScript.enabled}
                      onChange={(jsCode) =>
                        handleUpdate(activeScript.id, { jsCode })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="p-6 rounded-full bg-surface-3 mb-4">
                <Layout className="empty-state-icon" />
              </div>
              <h2>Select or create an injector</h2>
              <p className="max-w-[280px]">
                Create a new injector to start customizing your favorite
                websites with CSS and JS.
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
