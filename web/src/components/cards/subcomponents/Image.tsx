import React from 'react';
import { z } from 'zod';
import { IoChevronBack, IoChevronForward, IoImageOutline } from 'react-icons/io5';
import type { ImagesProps } from './Fields.types';
import '../../../styles/cards/subcomopnents/Images.css';

export function Images({
  mode = 'view',
  images = [],
  onChange,
  className,
  maxImages = 1,
}: ImagesProps) {
  const schema = React.useMemo(() => z.array(z.string()).max(maxImages, `Max ${maxImages} images`), [maxImages]);

  const [localImages, setLocalImages] = React.useState<string[]>(images);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [error, setError] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync with external changes
  React.useEffect(() => {
    setLocalImages(images);
    setCurrentIndex(0);
  }, [images]);

  const imageArray = mode === 'edit' ? localImages : images;

  const validateAndNotify = React.useCallback((arr: string[]) => {
    const validation = schema.safeParse(arr);
    setError(validation.success ? '' : validation.error.issues[0]?.message || '');
    onChange?.(arr);
  }, [schema, onChange]);

  const handleAddFiles = React.useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const availableSlots = maxImages - localImages.length;
    if (availableSlots <= 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length && newImages.length < availableSlots; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type)) {
        newImages.push(URL.createObjectURL(file));
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...localImages, ...newImages];
      setLocalImages(updatedImages);
      setCurrentIndex(updatedImages.length - 1);
      validateAndNotify(updatedImages);
    }
  }, [localImages, maxImages, validateAndNotify]);

  const handleAddClick = () => {
    if (localImages.length >= maxImages) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (localImages.length === 0) return;
    const updatedImages = localImages.filter((_, index) => index !== currentIndex);
    setLocalImages(updatedImages);
    setCurrentIndex(Math.min(currentIndex, updatedImages.length - 1));
    validateAndNotify(updatedImages);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : imageArray.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < imageArray.length - 1 ? prev + 1 : 0);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAddFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  // Drag and drop functionality
  React.useEffect(() => {
    if (mode !== 'edit') return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleAddFiles(e.dataTransfer?.files || null);
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [mode, handleAddFiles]);

  // View mode - don't show anything if no images
  if (mode === 'view') {
    if (!imageArray || imageArray.length === 0) return null;
    
    return (
      <div className={`image-view ${className || ''}`}>
        <div className="image-container">
          <img 
            src={imageArray[currentIndex]} 
            alt={`Image ${currentIndex + 1}`}
            className="image-display"
          />
          {imageArray.length > 1 && (
            <>
              <button 
                className="nav-button nav-button-prev"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <IoChevronBack />
              </button>
              <button 
                className="nav-button nav-button-next"
                onClick={handleNext}
                aria-label="Next image"
              >
                <IoChevronForward />
              </button>
              <div className="image-counter">
                {currentIndex + 1} / {imageArray.length}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className={`image-edit ${className || ''}`}>
      {localImages.length > 0 ? (
        <div className="image-container">
          <img 
            src={localImages[currentIndex]} 
            alt={`Image ${currentIndex + 1}`}
            className="image-display"
          />
          {localImages.length > 1 && (
            <>
              <button 
                className="nav-button nav-button-prev"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <IoChevronBack />
              </button>
              <button 
                className="nav-button nav-button-next"
                onClick={handleNext}
                aria-label="Next image"
              >
                <IoChevronForward />
              </button>
            </>
          )}
          <div className="image-counter">
            {currentIndex + 1} / {localImages.length}
          </div>
        </div>
      ) : (
        <div className="image-placeholder" onClick={handleAddClick}>
          <div className="placeholder-icon">
            <IoImageOutline />
          </div>
          <div className="placeholder-text">Click to add image</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />

      <div className="image-controls">
        <button
          className="btn btn-remove btn-sm"
          onClick={handleRemoveImage}
          disabled={localImages.length === 0}
          title="Remove current image"
        >
          Remove
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAddClick}
          disabled={localImages.length >= maxImages}
          title="Add image"
        >
          Add Image
        </button>
      </div>
      
      {error && <div className="image-error">{error}</div>}
    </div>
  );
}