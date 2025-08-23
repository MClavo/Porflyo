import React from "react";
import type { 
  TemplateZone, 
  PortfolioZoneData
} from "./types";
import type { PublicUserDto } from "../../types/dto";
import { HeroRenderer } from "./HeroRenderer";
import { AboutRenderer } from "./AboutRenderer";
import { CardsGridRenderer } from "./CardsGridRenderer";
import { ListRenderer } from "./ListRenderer";
import { SocialsRenderer } from "./SocialsRenderer";

interface ZoneRendererProps {
  zone: TemplateZone;
  zoneData?: PortfolioZoneData;
  user: PublicUserDto;
  onAddItem?: (zoneId: string) => void;
  onChangeVariant?: (zoneId: string, variant: string) => void;
  editorMode?: boolean;
}

export const ZoneRenderer: React.FC<ZoneRendererProps> = ({
  zone,
  zoneData,
  user,
  onAddItem,
  onChangeVariant,
  editorMode = true
}) => {
  const variant = zoneData?.variant ?? zone.defaultVariant ?? (zone.variants?.[0] || "default");
  const items = zoneData?.items ?? [];

  const handleVariantChange = (newVariant: string) => {
    if (onChangeVariant) {
      onChangeVariant(zone.id, newVariant);
    }
  };

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem(zone.id);
    }
  };

  const renderZoneContent = () => {
    const rendererProps = { variant, items, user };

    switch (zone.zoneType) {
      case "hero":
        return <HeroRenderer {...rendererProps} />;
      case "about":
        return <AboutRenderer {...rendererProps} />;
      case "cards-grid":
        return <CardsGridRenderer {...rendererProps} />;
      case "list":
        return <ListRenderer {...rendererProps} />;
      case "socials":
        return <SocialsRenderer {...rendererProps} />;
      default:
        return <div className="unknown-zone">Unknown zone type: {zone.zoneType}</div>;
    }
  };

  const renderEmptyState = () => (
    <div className="empty-zone-state p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
      <div className="mb-4">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-sm">No content in this zone</p>
      </div>
      {onAddItem && (
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add {zone.allowed[0] || "Content"}
        </button>
      )}
    </div>
  );

  // In runtime/public mode, skip rendering empty zones
  if (!editorMode && items.length === 0) {
    return null;
  }

  return (
    <div className="zone-renderer">
      {editorMode && (
        <div className="zone-header mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{zone.label}</h3>
            <div className="text-xs text-gray-500">
              {items.length}/{zone.maxItems || "∞"} items
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Variant Selector */}
            {zone.variants && zone.variants.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Variant:</label>
                <select
                  value={variant}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                >
                  {zone.variants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add Item Button */}
            {onAddItem && (!zone.maxItems || items.length < zone.maxItems) && (
              <button
                onClick={handleAddItem}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      )}

      <div className="zone-content">
        {items.length === 0 && editorMode ? renderEmptyState() : renderZoneContent()}
      </div>
    </div>
  );
};
