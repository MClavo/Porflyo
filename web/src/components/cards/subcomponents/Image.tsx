import React from 'react';
import { z } from 'zod';
import type { ImagesProps } from './Fields.types';
import AddImageButton from '../../buttons/AddImageButton';
import RemoveImageButton from '../../buttons/RemoveImageButton';
import './Images.css';


export function Images({
  mode = 'view',
  images = [],
  onChange,
  className,
  maxImages = 1,
}: ImagesProps) {

  // Accept any string for local/blob urls; enforce max length
  const schema = React.useMemo(() => z.array(z.string()).max(maxImages, `Max ${maxImages} images`), [maxImages]);

  const [local, setLocal] = React.useState<string[]>(images);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const imagesRef = React.useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const wheelTimeoutRef = React.useRef<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (mode === 'edit') setLocal(images);
  }, [images, mode]);

  const imageArray = mode === 'edit' ? local : images;

  const navigateToImage = React.useCallback((index: number) => {
    const element = imagesRef.current;
    if (!element || imageArray.length === 0) return;

    const targetIndex = Math.max(0, Math.min(index, imageArray.length - 1));
    const imageWidth = element.scrollWidth / imageArray.length;
    const targetScrollLeft = targetIndex * imageWidth;

    element.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    setCurrentImageIndex(targetIndex);
  }, [imageArray]);

  // wheel navigation (retain)
  React.useEffect(() => {
    const element = imagesRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      const direction = e.deltaY > 0 ? 1 : -1;
      if (imageArray.length <= 1) return;
      const newIndex = currentImageIndex + direction;
      if (newIndex >= 0 && newIndex < imageArray.length) navigateToImage(newIndex);
      wheelTimeoutRef.current = window.setTimeout(() => { wheelTimeoutRef.current = null; }, 150);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [currentImageIndex, imageArray, navigateToImage]);

  const validateAndNotify = React.useCallback((arr: string[]) => {
    const r = schema.safeParse(arr);
    setError(r.success ? undefined : r.error.issues[0]?.message);
    onChange?.(arr);
  }, [schema, onChange]);

  const addFiles = React.useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const slots = maxImages - local.length;
    if (slots <= 0) return;

    const toAdd: string[] = [];
    for (let i = 0; i < files.length && toAdd.length < slots; i++) {
      const f = files[i];
      if (!allowed.includes(f.type)) continue;
      const url = URL.createObjectURL(f);
      toAdd.push(url);
    }

    if (toAdd.length === 0) return;
    const next = [...local, ...toAdd];
    setLocal(next);
    validateAndNotify(next);
    // navigate to the last added
    navigateToImage(next.length - 1);
  }, [local, maxImages, navigateToImage, validateAndNotify]);

  const handleAddClick = () => {
    if (local.length >= maxImages) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (local.length === 0) return;
    const idx = currentImageIndex;
    const next = local.filter((_, i) => i !== idx);
    const newIndex = Math.max(0, Math.min(idx, next.length - 1));
    setLocal(next);
    validateAndNotify(next);
    setCurrentImageIndex(newIndex);
    // scroll to new index
    setTimeout(() => navigateToImage(newIndex), 50);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // reset input so same file can be picked again if needed
    if (e.target) e.target.value = '';
  };

  // Drag and drop
  React.useEffect(() => {
    const el = imagesRef.current;
    if (!el || mode !== 'edit') return;

    const onDragOver = (ev: DragEvent) => { ev.preventDefault(); el.classList.add('drag-over'); };
    const onDragLeave = () => { el.classList.remove('drag-over'); };
    const onDrop = (ev: DragEvent) => {
      ev.preventDefault();
      el.classList.remove('drag-over');
      const dt = ev.dataTransfer;
      if (!dt) return;
  addFiles(dt.files);
    };

  el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [mode, addFiles]);

  // click to navigate (left/right halves)
  const onClickNavigate = (e: React.MouseEvent) => {
    const el = imagesRef.current;
    if (!el || imageArray.length <= 1) return;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) navigateToImage(currentImageIndex - 1);
    else navigateToImage(currentImageIndex + 1);
  };

  return (
    <div className={`images-wrapper ${className ?? ''}`}>
      <div
        ref={imagesRef}
        className={`images ${mode === 'edit' ? 'editable' : ''}`}
        onClick={onClickNavigate}
      >
        {imageArray.map((src, i) => (
          <div key={i} className="image-item">
            <img src={src} alt={`Image ${i + 1}`} />
            {imageArray.length > 1 && (
              <div className="image-index-overlay">{i + 1}/{imageArray.length}</div>
            )}
          </div>
        ))}
      </div>

      {mode === 'edit' && (
        <div className="images-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={onFileInput}
          />

          <div className="images-controls-row">
            <RemoveImageButton
              onClick={handleRemove}
              disabled={local.length === 0}
              title="Remove current image"
            />
            <AddImageButton
              onClick={handleAddClick}
              disabled={local.length >= maxImages}
              title="Add image"
            />
          </div>
          {error && <div className="images-error">{error}</div>}
        </div>
      )}
    </div>
  );

}