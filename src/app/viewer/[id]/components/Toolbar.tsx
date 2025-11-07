import { ZoomIn, Move, Sun, RefreshCw } from "lucide-react";
import Tooltip from "./Tooltip";

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onReset: () => void;
}

const tools = [
  { name: "Zoom", icon: ZoomIn, label: "Zoom" },
  { name: "Pan", icon: Move, label: "Pan" },
  { name: "Wwwc", icon: Sun, label: "Window/Level" },
];

const Toolbar = ({ activeTool, onToolChange, onReset }: ToolbarProps) => {
  return (
    <nav className="bg-slate-900/50 border-l border-white/10 w-20 flex flex-col items-center py-4 gap-2">
      {tools.map(({ name, icon: Icon, label }) => (
        <Tooltip key={name} text={label}>
          <button
            onClick={() => onToolChange(name)}
            className={`p-3 rounded-lg transition-colors ${
              activeTool === name
                ? "bg-cyan-500 text-white"
                : "text-cyan-200/80 hover:bg-white/10"
            }`}
            title={label}
          >
            <Icon />
          </button>
        </Tooltip>
      ))}
      <Tooltip text="Reset">
        <button
          onClick={onReset}
          className="p-3 mt-auto rounded-lg text-cyan-200/80 hover:bg-white/10 transition-colors"
          title="Reset"
        >
          <RefreshCw />
        </button>
      </Tooltip>
    </nav>
  );
};

export default Toolbar;
