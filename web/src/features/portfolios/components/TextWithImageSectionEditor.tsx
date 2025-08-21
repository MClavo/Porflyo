import { useFormContext, useFieldArray } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';
import { SECTION_LIMITS } from '../types/sections';

interface TextWithImageSectionEditorProps {
  sectionIndex: number;
}

export function TextWithImageSectionEditor({ sectionIndex }: TextWithImageSectionEditorProps) {
  const { register, control, formState: { errors }, watch } = useFormContext<PortfolioFormData>();
  
  const sectionPath = `sections.${sectionIndex}` as const;
  const content = watch(`${sectionPath}.content`);
  const image = watch(`${sectionPath}.image`);
  const sectionKind = watch(`${sectionPath}.kind`);
  
  // Field array for links
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: `${sectionPath}.links`,
  });

  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    const sectionErrors = errors.sections?.[sectionIndex];
    return sectionErrors?.[field as keyof typeof sectionErrors] as { message?: string } | undefined;
  };

  const addLink = () => {
    if (linkFields.length < SECTION_LIMITS.MAX_LINKS_PER_SECTION) {
      appendLink({ text: '', url: '' });
    }
  };

  return (
    <div className="form-container">
      {/* Title */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-title`} className="form-label">
          Title *
        </label>
        <input
          type="text"
          id={`section-${sectionIndex}-title`}
          {...register(`${sectionPath}.title`)}
          className={`form-input ${getFieldError('title') ? 'error' : ''}`}
          placeholder="Section title"
          maxLength={SECTION_LIMITS.MAX_TITLE_LENGTH}
        />
        {getFieldError('title') && (
          <p className="error-message">{getFieldError('title')?.message}</p>
        )}
        <p className="field-hint">
          {watch(`${sectionPath}.title`)?.length || 0}/{SECTION_LIMITS.MAX_TITLE_LENGTH} characters
        </p>
      </div>

      {/* Image */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-image`} className="form-label">
          Image * ({sectionKind === 'TEXT_WITH_IMAGE_LEFT' ? 'Left aligned' : 'Right aligned'})
        </label>
        <input
          type="url"
          id={`section-${sectionIndex}-image`}
          {...register(`${sectionPath}.image`)}
          className={`form-input ${getFieldError('image') ? 'error' : ''}`}
          placeholder="https://example.com/image.jpg"
        />
        {getFieldError('image') && (
          <p className="error-message">{getFieldError('image')?.message}</p>
        )}
        {image && (
          <div className="image-preview">
            <img 
              src={image} 
              alt="Preview" 
              className="preview-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-content`} className="form-label">
          Content *
        </label>
        <textarea
          id={`section-${sectionIndex}-content`}
          {...register(`${sectionPath}.content`)}
          className={`form-input ${getFieldError('content') ? 'error' : ''}`}
          placeholder="Section content..."
          rows={6}
          maxLength={SECTION_LIMITS.MAX_CONTENT_LENGTH}
        />
        {getFieldError('content') && (
          <p className="error-message">{getFieldError('content')?.message}</p>
        )}
        <p className="field-hint">
          {content?.length || 0}/{SECTION_LIMITS.MAX_CONTENT_LENGTH} characters
        </p>
      </div>

      {/* Links */}
      <div className="form-group">
        <div className="links-header">
          <label className="form-label">Links</label>
          <button
            type="button"
            onClick={addLink}
            disabled={linkFields.length >= SECTION_LIMITS.MAX_LINKS_PER_SECTION}
            className="btn-sm btn-outline"
          >
            Add Link
          </button>
        </div>
        
        {linkFields.length > 0 && (
          <div className="links-container">
            {linkFields.map((field, linkIndex) => (
              <div key={field.id} className="link-item">
                <div className="form-grid">
                  <div>
                    <input
                      type="text"
                      {...register(`${sectionPath}.links.${linkIndex}.text`)}
                      className="form-input"
                      placeholder="Link text"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      {...register(`${sectionPath}.links.${linkIndex}.url`)}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(linkIndex)}
                  className="btn-sm btn-outline delete-btn"
                  title="Remove link"
                >
                  <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {linkFields.length === 0 && (
          <p className="empty-state">No links added yet. Click "Add Link" to add one.</p>
        )}
        
        <p className="field-hint">
          {linkFields.length}/{SECTION_LIMITS.MAX_LINKS_PER_SECTION} links
        </p>
      </div>
    </div>
  );
}
