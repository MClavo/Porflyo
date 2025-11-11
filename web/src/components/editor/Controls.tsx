import type { TemplateKey } from '../../templates/Template.types';
import { templateList } from '../../templates/Template.types';
import type { Mode } from '../cards/subcomponents/Fields.types';

export default function Controls({
  mode,
  toggleMode,
  selectedTemplate,
  onSelectTemplate,
}: {
  mode: Mode;
  toggleMode: () => void;
  selectedTemplate: TemplateKey;
  onSelectTemplate: (t: TemplateKey) => void;
}) {
  return (
    <div className="header-controls">
      <button className="mode-toggle" onClick={toggleMode} aria-pressed={mode === 'edit'}>
        {mode === 'view' ? 'View' : 'Edit'}
      </button>

      <select id="template-select" value={selectedTemplate} onChange={(e) => onSelectTemplate(e.target.value as TemplateKey)} aria-label="Select template">
        {templateList.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
