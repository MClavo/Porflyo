import { 
  TEMPLATES, 
  getAllTemplates, 
  templateForbidsImages,
} from '../templates';
import type { TemplateId } from '../templates';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onTemplateChange: (templateId: TemplateId) => void;
  className?: string;
}

/**
 * Template selector component for portfolio editor
 * Shows template options with warnings for constraints like ATS no-images
 */
export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateChange, 
  className = '' 
}: TemplateSelectorProps) {
  const templates = getAllTemplates();
  const selectedTemplateMeta = TEMPLATES[selectedTemplate];
  const showImageWarning = templateForbidsImages(selectedTemplate);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Template
      </label>
      
      {/* Template Dropdown */}
      <select
        value={selectedTemplate}
        onChange={(e) => onTemplateChange(e.target.value as TemplateId)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      {/* Template Info */}
      <div className="mt-2 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <span className="font-medium">Layout:</span>
          <span className="capitalize">{selectedTemplateMeta.layout}</span>
          {selectedTemplateMeta.supportsImages ? (
            <span className="text-green-600">• Supports images</span>
          ) : (
            <span className="text-orange-600">• Text-only</span>
          )}
        </p>
        {selectedTemplateMeta.notes && (
          <p className="mt-1 text-gray-500">{selectedTemplateMeta.notes}</p>
        )}
      </div>

      {/* ATS Warning */}
      {showImageWarning && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Images Not Supported
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The ATS template does not display images to ensure maximum compatibility with Applicant Tracking Systems. Any images in your sections will be hidden in the public view.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Info */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Template Preview
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Changes to the template will update the preview immediately. Your portfolio will be displayed using the {selectedTemplateMeta.name.toLowerCase()} layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
