import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a circular crop area centered in the image
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50, 
        },
        1, // 1:1 aspect ratio for circular crop
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Set canvas size to desired output size (profile picture size)
    const outputSize = 200; // 200x200 pixels for profile picture
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    ctx.restore();

    // Convert to WebP blob with compression
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/webp',
      0.8 // 80% quality for good compression
    );
  }, [completedCrop, onCropComplete]);

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-overlay" onClick={onCancel} />
      <div className="image-cropper-container">
        <div className="image-cropper-header">
          <h3>Ajustar foto de perfil</h3>
          <p>Mueve y redimensiona la imagen para que quede perfecta en tu perfil</p>
        </div>
        
        <div className="image-cropper-content">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Force 1:1 aspect ratio
              circularCrop // Show circular crop area
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="image-cropper-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={getCroppedImg}
            className="btn"
            disabled={!completedCrop}
          >
            Aceptar
          </button>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageCropper;
