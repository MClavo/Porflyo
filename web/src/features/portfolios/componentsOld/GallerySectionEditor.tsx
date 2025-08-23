import { useFormContext } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';
import { SECTION_LIMITS, IMAGE_CONTAINING_SECTIONS } from '../types/sectionsOLD';

interface GallerySectionEditorProps {
  sectionIndex: number;
}

export function GallerySectionEditor({ sectionIndex }: GallerySectionEditorProps) {
  const { formState: { errors }, watch, setValue } = useFormContext<PortfolioFormData>();
  
  const sectionPath = `sections.${sectionIndex}` as const;
  const images = watch(`${sectionPath}.images`) || [];
  const sectionKind = watch(`${sectionPath}.kind`);
  const allSections = watch('sections') || [];
  
  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    const sectionErrors = errors.sections?.[sectionIndex];
    return sectionErrors?.[field as keyof typeof sectionErrors] as { message?: string } | undefined;
  };

  // Calculate total images in portfolio
  const getTotalImagesInPortfolio = () => {
    let total = 0;
    allSections.forEach((section, idx) => {
      if (IMAGE_CONTAINING_SECTIONS.includes(section.kind)) {
        if (section.kind === 'TEXT_WITH_IMAGE_LEFT' || section.kind === 'TEXT_WITH_IMAGE_RIGHT') {
          // Only count if not the current section or if current section has an image
          if (idx !== sectionIndex || section.image) {
            total += 1;
          }
        } else if (section.kind === 'GALLERY_LARGE' || section.kind === 'GALLERY_SMALL' || section.kind === 'GALLERY_GRID') {
          // Only count if not the current section
          if (idx !== sectionIndex) {
            total += section.images?.length || 0;
          }
        }
      }
    });
    return total;
  };

  const canAddMoreImages = () => {
    const totalOtherImages = getTotalImagesInPortfolio();
    const currentImages = images.length;
    return (totalOtherImages + currentImages) < SECTION_LIMITS.MAX_IMAGES_PER_PORTFOLIO;
  };

  const addImage = () => {
    if (canAddMoreImages() && images.length < 20) {
      const newImages = [...images, ''];
      setValue(`${sectionPath}.images`, newImages);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setValue(`${sectionPath}.images`, newImages);
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    setValue(`${sectionPath}.images`, newImages);
  };

  const getGalleryTypeDescription = () => {
    switch (sectionKind) {
      case 'GALLERY_LARGE':
        return 'Large gallery with prominent image display';
      case 'GALLERY_SMALL':
        return 'Small gallery with compact image layout';
      case 'GALLERY_GRID':
        return 'Grid gallery with organized image arrangement';
      default:
        return 'Gallery section';
    }
  };

  return (
    <div className="form-container">
      {/* Gallery Type Info */}
      <div className="form-group">
        <div className="gallery-info">
          <h4 className="form-label">{getGalleryTypeDescription()}</h4>
          <p className="field-hint">
            Images used: {getTotalImagesInPortfolio() + images.length}/{SECTION_LIMITS.MAX_IMAGES_PER_PORTFOLIO} 
            (portfolio limit, excluding avatar)
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="form-group">
        <div className="links-header">
          <label className="form-label">Images *</label>
          <button
            type="button"
            onClick={addImage}
            disabled={!canAddMoreImages() || images.length >= 20}
            className="btn-sm btn-outline"
            title={!canAddMoreImages() ? 'Portfolio image limit reached' : undefined}
          >
            Add Image
          </button>
        </div>

        {images.length > 0 && (
          <div className="images-container">
            {images.map((imageUrl, imageIndex) => (
              <div key={imageIndex} className="image-item">
                <div className="image-input-container">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => updateImage(imageIndex, e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(imageIndex)}
                    className="btn-sm btn-outline delete-btn"
                    title="Remove image"
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {imageUrl && (
                  <div className="image-preview">
                    <img 
                      src={imageUrl} 
                      alt={`Gallery image ${imageIndex + 1}`}
                      className="preview-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {images.length === 0 && (
          <p className="empty-state">No images added yet. Click "Add Image" to add one.</p>
        )}
        
        <p className="field-hint">
          {images.length}/20 images per gallery
        </p>
        
        {!canAddMoreImages() && (
          <p className="error-message">
            Portfolio image limit reached ({SECTION_LIMITS.MAX_IMAGES_PER_PORTFOLIO} max). 
            Remove images from other sections to add more here.
          </p>
        )}
        
        {getFieldError('images') && (
          <p className="error-message">{getFieldError('images')?.message}</p>
        )}
      </div>

      {/* Gallery Preview */}
      {images.filter(Boolean).length > 0 && (
        <div className="form-group">
          <label className="form-label">Preview</label>
          <div className={`gallery-preview gallery-preview-${sectionKind?.toLowerCase()}`}>
            {images.filter(Boolean).map((imageUrl, index) => (
              <div key={index} className="gallery-image">
                <img 
                  src={imageUrl} 
                  alt={`Gallery ${index + 1}`}
                  className="preview-image"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
