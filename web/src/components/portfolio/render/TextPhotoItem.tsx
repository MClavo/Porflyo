import React, { useRef, useState, useCallback } from "react";
import type { EditItemProps } from "../../../types/itemDto";
import { compressImage, validateImageFile } from "../../../lib/images/compression";
import "./TextPhotoItem.css";

export function TextPhotoItem({
  id,
  item,
  editable = false,
  onItemUpdate,
  onStartEdit,
  onEndEdit,
  className = "",
  style,
}: EditItemProps) {
  const title = item && "text1" in item ? item.text1 : "";
  const subtitle = item && "text2" in item ? item.text2 : "";
  const imageUrl = item && "imageUrl" in item ? item.imageUrl : "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate the file first
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error || "Please select a valid image file");
        return;
      }

      setIsProcessing(true);
      try {
        // Compress the image
        const compressedFile = await compressImage(file);
        
        // Create local URL for preview
        const imageUrl = URL.createObjectURL(compressedFile);
        
        onItemUpdate?.(id, {
          type: "textPhoto",
          text1: title,
          text2: subtitle,
          imageUrl,
          // Store the compressed file for later S3 upload
          imageFile: compressedFile,
        });
      } catch (error) {
        console.error('Image compression failed:', error);
        alert('Failed to process image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [id, title, subtitle, onItemUpdate]
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  if (editable) {
    return (
      <div className={className} style={style}>
        <div className="text-photo-container">
          {/* Left half - Text content */}
          <div className="text-content">
            <input
              className="item-title"
              value={title ?? ""}
              placeholder="Title"
              maxLength={30}
              onFocus={() => onStartEdit?.()}
              onBlur={() => onEndEdit?.()}
              onChange={(e) =>
                onItemUpdate?.(id, {
                  type: "textPhoto",
                  text1: e.target.value,
                  text2: subtitle ?? "",
                  imageUrl: imageUrl ?? "",
                })
              }
            />
            
            <textarea
              className="item-description"
              value={subtitle ?? ""}
              placeholder="Description"
              maxLength={500}
              onFocus={() => onStartEdit?.()}
              onBlur={() => onEndEdit?.()}
              onChange={(e) =>
                onItemUpdate?.(id, {
                  type: "textPhoto",
                  text1: title ?? "",
                  text2: e.target.value,
                  imageUrl: imageUrl ?? "",
                })
              }
            />
          </div>

          {/* Right half - Image */}
          <div className="image-content">
            <div
              className={`image-upload ${
                isDragging ? "dragging" : ""
              }`}
              onClick={handleImageClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Uploaded content"
                  className="uploaded-image"
                />
              ) : isProcessing ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">⏳</div>
                  <div className="upload-text">Processing...</div>
                  <div className="upload-subtext">Please wait</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">Click to upload</div>
                  <div className="upload-subtext">JPG, PNG</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div className="text-photo-container">
        {/* Left half - Text content */}
        <div className="text-content">
          <div className="item-title">
            {title ?? (
              <span className="placeholder">Title...</span>
            )}
          </div>
          
          <div className="item-description">
            {subtitle ?? (
              <span className="placeholder">Description...</span>
            )}
          </div>
        </div>

        {/* Right half - Image */}
        <div className="image-content">
          <div className="image-display">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Content"
                className="display-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🖼️</div>
                <div className="placeholder-text">No image</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextPhotoItem;
