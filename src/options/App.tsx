import { useState, useEffect, useMemo } from "react";
import { getAll } from "../lib/storage";
import type { ExtensionState, ScriptEntry } from "../lib/types";
import { exportData, importData } from "../lib/import-export";
import { ToastProvider, toast } from "../components/ui/Toast";
import { useConfirmDialog } from "../components/ui/ConfirmDialog";

// Components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { EditorPanel } from "./components/EditorPanel";
import { EmptyState } from "./components/EmptyState";

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
      import("../lib/storage").then((lib) => lib.saveAll(state));
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const activeScript = useMemo(() => {
    return state?.scripts.find((s) => s.id === activeId) || null;
  }, [state, activeId]);

  async function handleAdd() {
    if (!state) return;
    const script: ScriptEntry = {
      id: crypto.randomUUID(),
      name: "",
      cssCode: "/* Add your CSS here */\n\n\n\n\n\n\n\n\n",
      jsCode: "// Add your JavaScript here\n\n\n\n\n\n\n\n\n",
      urlPatterns: ["*://example.com/*"],
      enabled: true,
      delayMs: 500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState({ ...state, scripts: [...state.scripts, script] });
    setActiveId(script.id);
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
      message: "This action cannot be undone. All code for this injector will be lost.",
      danger: true,
      confirmLabel: "Delete permanently",
    });
    if (ok) {
      const newScripts = state.scripts.filter((s) => s.id !== id);
      setState({ ...state, scripts: newScripts });
      if (activeId === id) {
        setActiveId(newScripts[0]?.id || null);
      }
    }
  }

  async function handleToggleGlobal() {
    if (!state) return;
    const next = !state.globalEnabled;
    setState({ ...state, globalEnabled: next });
  }

  function handleOpenHelp() {
    window.open(
      "https://github.com/krittanon-w/kw-browser-extension-scripts-injector/blob/main/HELP.md",
      "_blank",
    );
  }

  async function handleImport(file: File) {
    if (!state) return;
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
  }

  if (!state) return null;

  return (
    <div className="options-layout bg-surface-1">
      <ToastProvider />
      {confirmDialog}

      <Header 
        globalEnabled={state.globalEnabled} 
        onToggleGlobal={handleToggleGlobal}
        onOpenHelp={handleOpenHelp}
      />

      <div className="options-body">
        <Sidebar 
          state={state}
          search={search}
          onSearchChange={setSearch}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={handleAdd}
          onExport={() => exportData(state)}
          onImport={handleImport}
        />

        <main className="main-panel">
          {activeScript ? (
            <EditorPanel 
              script={activeScript}
              onUpdate={(updates) => handleUpdate(activeScript.id, updates)}
              onDelete={() => handleDelete(activeScript.id)}
              onOpenHelp={handleOpenHelp}
            />
          ) : (
            <EmptyState onAdd={handleAdd} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
