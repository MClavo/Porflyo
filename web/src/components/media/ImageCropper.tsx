import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

const OUTPUT_SIZE = 500; // fixed output size in pixels

const ImageCropper: React.FC<ImageCropperProps> = ({ imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>('');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image as data URL
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Initialize centered square crop on image load
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 50 }, 1, width, height),
      width,
      height
    );
    setCrop(initial);
  }, []);

  // Generate cropped image blob at fixed resolution
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // set canvas to fixed size
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    // calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // clear canvas
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // draw cropped area into canvas, scaled to OUTPUT_SIZE
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    // export as WebP
    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      'image/webp',
      0.8
    );
  }, [completedCrop, onCropComplete]);

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-overlay" onClick={onCancel} />
      <div className="image-cropper-container">
        <div className="image-cropper-header">
          <h3>Adjust Profile Photo</h3>
          <p>Move and resize the image until it looks perfect.</p>
        </div>

        <div className="image-cropper-content">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, pct) => setCrop(pct)}
              onComplete={setCompletedCrop}
              aspect={1}              // enforce square aspect
              circularCrop         // show circular overlay
              minWidth={50}
              minHeight={50}
              keepSelection
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="To be cropped"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: 400 }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="image-cropper-actions">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="button" onClick={getCroppedImg} className="btn" disabled={!completedCrop}>
            Accept
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* custom styles for react-image-crop overlay & handles */}
      <style>{`
        /* circular overlay border in white */
        
        .ReactCrop__crop-selection {
          border: 1px solid white !important;
          border-radius: 50% !important;
          box-shadow: none !important;
        }
        /* remove marching-ants animation */
        .ReactCrop__crop-selection::before,
        .ReactCrop__crop-selection::after {
          display: none;
        }

        /* circular white handles */
        .ReactCrop__drag-handle {
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: white !important;
          border: 1px solid grey !important;
        }
      `}</style>
    </div>
  );
};

export default ImageCropper;
