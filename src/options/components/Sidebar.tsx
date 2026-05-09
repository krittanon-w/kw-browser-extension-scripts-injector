import { Plus, Download, Upload, Check, X } from "lucide-react";
import type { ScriptEntry, ExtensionState } from "../../lib/types";
import { cn } from "../../components/ui/cn";
import { useMemo } from "react";
import { Button } from "../../components/ui/Button";

interface SidebarProps {
  state: ExtensionState;
  search: string;
  onSearchChange: (value: string) => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function Sidebar({
  state,
  search,
  onSearchChange,
  activeId,
  onSelect,
  onAdd,
  onExport,
  onImport,
}: SidebarProps) {
  const groupedScripts = useMemo(() => {
    const query = search.toLowerCase();
    const filtered = state.scripts.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.urlPatterns.some((p) => p.toLowerCase().includes(query)),
    );

    const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      enabled: sorted.filter((s) => s.enabled),
      disabled: sorted.filter((s) => !s.enabled),
    };
  }, [state.scripts, search]);

  const renderSidebarItem = (s: ScriptEntry) => (
    <button
      key={s.id}
      className={cn(
        "sidebar-item sidebar-item-anim",
        activeId === s.id && "active",
        !s.enabled && "disabled-item",
      )}
      onClick={() => onSelect(s.id)}
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {s.enabled ? (
          <Check className="text-primary" size={14} strokeWidth={3} />
        ) : (
          <X className="text-danger" size={14} strokeWidth={3} />
        )}
      </div>
      <span className="sidebar-item-name">
        {(s.urlPatterns[0] || "No pattern").split("\n")[0]}
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
    <aside className="sidebar">
      <div className="sidebar-search">
        <input
          type="text"
          className="input h-9"
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={onAdd}
        >
          <Plus size={16} />
          <span>New Injector</span>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 justify-center px-0"
            title="Export JSON"
            onClick={onExport}
          >
            <Download size={14} />
          </Button>
          <label
            className="btn btn-secondary flex-1 justify-center px-0 cursor-pointer"
            title="Import JSON"
          >
            <Upload size={14} />
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
