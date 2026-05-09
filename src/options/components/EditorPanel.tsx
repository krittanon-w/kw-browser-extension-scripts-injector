import { Trash2, ExternalLink, Code2, FileCode2, Clock, Check, AlertCircle, HelpCircle } from "lucide-react";
import type { ScriptEntry } from "../../lib/types";
import { CodeEditor } from "../../components/CodeEditor";
import { Switch } from "../../components/ui/Switch";
import { cn } from "../../components/ui/cn";
import { matchesUrl } from "../../lib/url-matcher";
import { formatRelativeTime, formatDateTime, formatDate } from "../../lib/date-utils";
import { Button } from "../../components/ui/Button";

interface EditorPanelProps {
  script: ScriptEntry;
  onUpdate: (updates: Partial<ScriptEntry>) => void;
  onDelete: () => void;
  onOpenHelp: () => void;
}

export function EditorPanel({ script, onUpdate, onDelete, onOpenHelp }: EditorPanelProps) {
  return (
    <div className="main-content-wrapper">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-text-hi font-semibold text-lg overflow-hidden text-ellipsis whitespace-nowrap">
            {script.urlPatterns[0] || "No URL Pattern"}
          </div>
          <div className="text-xs text-text-muted flex items-center gap-2">
            <Clock size={12} />
            <span title={formatDateTime(script.updatedAt)}>
              Last updated: {formatDate(script.updatedAt)} |{" "}
              {formatRelativeTime(script.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            label={script.enabled ? "Active" : "Disabled"}
            checked={script.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
          />
          <div className="w-[1px] h-6 bg-border mx-1" />
          <Button
            variant="outline-danger"
            className="p-2 rounded-md"
            onClick={onDelete}
            title="Delete Injector"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className="sep" />

      {/* URL Patterns & Delay Row */}
      <div className="flex gap-4 items-start">
        {/* URL Patterns */}
        <div className="field-group flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="field-label !mb-0">URL Patterns</label>
              <button
                onClick={onOpenHelp}
                className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                title="Help"
              >
                <HelpCircle size={14} />
              </button>
            </div>
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
            disabled={!script.enabled}
            value={script.urlPatterns.join("\n")}
            onChange={(e) =>
              onUpdate({
                urlPatterns: e.target.value.split("\n").filter((p) => p.trim()),
              })
            }
          />
        </div>

        {/* Delay */}
        <div className="field-group w-48 shrink-0">
          <label className="field-label !mb-0">Injection Delay (ms)</label>
          <input
            type="number"
            className="input h-9"
            min="0"
            step="50"
            disabled={!script.enabled}
            value={script.delayMs}
            onChange={(e) => onUpdate({ delayMs: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Test URL Matching */}
      <div className="field-group mt-2">
        <div className="flex items-center gap-2 mb-2">
          <label className="field-label !mb-0">Test URL Matching</label>
          <button
            onClick={onOpenHelp}
            className="text-text-muted hover:text-primary transition-colors cursor-pointer"
            title="Help"
          >
            <HelpCircle size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {(script.testUrls || [""])
            .concat(
              (script.testUrls?.length || 0) > 0 &&
                script.testUrls![script.testUrls!.length - 1].trim() !== ""
                ? [""]
                : [],
            )
            .map((url, idx) => {
              const isMatch = url.trim() ? matchesUrl(url, script.urlPatterns) : null;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    className="input h-9 text-xs font-mono flex-1"
                    placeholder="Enter URL to test..."
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...(script.testUrls || [])];
                      while (newUrls.length <= idx) newUrls.push("");
                      newUrls[idx] = e.target.value;
                      onUpdate({ testUrls: newUrls });
                    }}
                  />
                  <div className="w-36 shrink-0">
                    {url.trim() && (
                      <div className={cn(
                        "match-result py-1 px-2 text-[10px] w-full justify-center",
                        isMatch ? "match" : "no-match",
                      )}>
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
                    {idx < (script.testUrls?.length || 0) && (
                      <Button
                        variant="outline-danger"
                        className="p-1 rounded-md"
                        onClick={() => {
                          const newUrls = script.testUrls!.filter((_, i) => i !== idx);
                          onUpdate({ testUrls: newUrls });
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 gap-6 mt-2">
        <div className="editor-section">
          <div className="editor-section-header">
            <div className="flex items-center gap-2">
              <FileCode2 className="text-css" size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider text-css">
                Custom CSS
              </span>
              <button
                onClick={onOpenHelp}
                className="text-text-muted hover:text-primary transition-colors ml-1 cursor-pointer"
                title="Help"
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>
          <div className={cn(
            "card border-css/30",
            !script.enabled && "opacity-50"
          )}>
            <CodeEditor
              value={script.cssCode}
              language="css"
              readOnly={!script.enabled}
              onChange={(cssCode) => onUpdate({ cssCode })}
            />
          </div>
        </div>

        <div className="editor-section">
          <div className="editor-section-header">
            <div className="flex items-center gap-2">
              <Code2 className="text-js" size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider text-js">
                Custom JavaScript
              </span>
              <button
                onClick={onOpenHelp}
                className="text-text-muted hover:text-primary transition-colors ml-1 cursor-pointer"
                title="Help"
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>
          <div className={cn(
            "card border-js/30",
            !script.enabled && "opacity-50"
          )}>
            <CodeEditor
              value={script.jsCode}
              language="js"
              readOnly={!script.enabled}
              onChange={(jsCode) => onUpdate({ jsCode })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
