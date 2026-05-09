import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="p-8 rounded-3xl bg-surface-3 mb-6 shadow-xl border border-border/50">
        <img src="/icon.png" className="w-20 h-20 object-contain" alt="Logo" />
      </div>
      <h2>Select or create an injector</h2>
      <p className="max-w-[280px]">
        Create a new injector to start customizing your favorite
        websites with CSS and JS.
      </p>
      <button className="btn btn-primary mt-4" onClick={onAdd}>
        <Plus size={16} />
        <span>Create First Injector</span>
      </button>
    </div>
  );
}
