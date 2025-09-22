import type { Mode } from "../../components/cards/subcomponents/Fields.types";
import type { TemplateKey } from "../../templates/Template.types";

export default function Header(props: {
  mode: Mode;
  onToggleMode: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedTemplate: TemplateKey;
  onSelectTemplate: (t: TemplateKey) => void;
  templateList: TemplateKey[];
}) {
  const {
    mode,
    onToggleMode,
    onToggleSidebar,
    sidebarOpen,
    selectedTemplate,
    onSelectTemplate,
    templateList,
  } = props;
  return (
    <header className="test-header">
      <h1>Settings</h1>
      <div className="header-controls">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-pressed={sidebarOpen}
          aria-label={sidebarOpen ? "Ocultar estado" : "Mostrar estado"}
        >
          {sidebarOpen ? "Hide" : "Show"}
        </button>
        <button
          className="mode-toggle"
          onClick={onToggleMode}
          aria-pressed={mode === "edit"}
        >
          {mode === "view" ? "View" : "Edit"}
        </button>

        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => onSelectTemplate(e.target.value as TemplateKey)}
          aria-label="Select template"
        >
          {templateList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
