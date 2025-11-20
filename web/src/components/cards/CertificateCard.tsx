import React from "react";
import { Title, Date, Images } from "./subcomponents/index";
import type { Mode, MonthYearValue } from "./subcomponents/index";
import "../../styles/cards/CertificateCard.css";

export type CertificateCardSaved = {
  title: string;
  date: MonthYearValue;
  image?: string;
  certificateUrl?: string;
};

interface CertificateCardProps {
  mode?: Mode;
  title: string;
  date: MonthYearValue;
  image?: string;
  certificateUrl?: string;
  onPatch?: (patch: Partial<CertificateCardSaved>) => void;
  children?: React.ReactNode;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  mode = "view",
  title,
  date,
  image,
  certificateUrl,
  onPatch,
  children,
}) => {
  // Use a ref and ResizeObserver to keep a CSS variable with the
  // current card width so styles can use it (e.g. to size images).
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // set initial value
    const setVar = () => {
      const w = el.getBoundingClientRect().width;
      el.style.setProperty("--current-card-width", `${Math.round(w)}px`);
    };

    setVar();

    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const images = image ? [image] : [];

  return (
    <div 
      ref={cardRef} 
      className="certificate-card" 
      data-mode={mode}
    >
      {/* render injected children (e.g. delete button) */}
      {children}
      
      {/* Image container */}
      <div className="certificate-card__image">
        {(images.length > 0 || mode === "edit") && (
          <Images
            mode={mode}
            images={images}
            maxImages={1}
            onChange={(next) => onPatch?.({ image: next[0] || undefined })}
          />
        )}
      </div>

      {/* Content container */}
      <div className="certificate-card__content">
        {/* Header: Title and Date */}
        <div className="certificate-card__header">
          <Title
            mode={mode}
            value={title}
            className="certificate-card__title"
            placeholder="Certificate Title"
            required
            maxLength={60}
            onChange={(v) => onPatch?.({ title: v })}
          />
          
          <div className="certificate-card__date">
            <Date
              mode={mode}
              value={date}
              onChange={(v) => onPatch?.({ date: v })}
            />
          </div>
        </div>

        {/* Certificate URL - only show in edit mode */}
        {mode === "edit" && (
          <div className="certificate-card__url">
            <div className="url-input-group">
              <label className="url-label">Certificate URL:</label>
              <input
                type="url"
                value={certificateUrl || ""}
                placeholder="https://certificate-url.com"
                onChange={(e) => onPatch?.({ certificateUrl: e.target.value || undefined })}
                className="url-input"
              />
            </div>
          </div>
        )}

        {/* Footer button - only show in view mode if URL exists */}
        {mode === "view" && certificateUrl && (
          <div className="certificate-card__footer">
            <a 
              href={certificateUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-certificate"
            >
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
