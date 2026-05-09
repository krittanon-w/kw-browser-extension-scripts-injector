import { HelpCircle } from "lucide-react";
import { Switch } from "../../components/ui/Switch";
import { Button } from "../../components/ui/Button";

interface HeaderProps {
  globalEnabled: boolean;
  onToggleGlobal: () => void;
  onOpenHelp: () => void;
}

export function Header({ globalEnabled, onToggleGlobal, onOpenHelp }: HeaderProps) {
  return (
    <header className="options-header">
      <div className="options-header-title">
        <img src="/icon.png" className="w-8 h-8 object-contain" alt="Logo" />
        <span>Scripts Injector</span>
      </div>

      <div className="flex items-center gap-4">
        <Switch
          label="Disable/Enable Extension"
          checked={globalEnabled}
          onChange={onToggleGlobal}
        />
        <div className="w-[1px] h-6 bg-border mx-1" />
        <Button
          variant="secondary"
          className="p-2 rounded-full"
          onClick={onOpenHelp}
          title="Help & Documentation"
        >
          <HelpCircle size={18} />
        </Button>
      </div>
    </header>
  );
}
