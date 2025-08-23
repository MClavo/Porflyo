import React, { useState, useEffect } from "react";
import type { TemplateZone, EditorSectionType } from "./types";

interface AddSectionDialogProps {
  open: boolean;
  zone: TemplateZone;
  currentVariant?: string;
  onCancel: () => void;
  onConfirm: (payload: { 
    sectionType: EditorSectionType; 
    variant: string; 
    initialFields?: Record<string, unknown> 
  }) => void;
}

export const AddSectionDialog: React.FC<AddSectionDialogProps> = ({
  open,
  zone,
  currentVariant,
  onCancel,
  onConfirm
}) => {
  const [step, setStep] = useState(1);
  const [selectedSectionType, setSelectedSectionType] = useState<EditorSectionType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(currentVariant || zone?.defaultVariant || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Reset dialog state when opened
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedSectionType(null);
      setSelectedVariant(currentVariant || zone?.defaultVariant || "");
      setTitle("");
      setDescription("");
    }
  }, [open, currentVariant, zone?.defaultVariant]);

  if (!open || !zone) return null;

  const handleNext = () => {
    if (step === 1 && selectedSectionType) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleConfirm = () => {
    if (!selectedSectionType) return;

    const payload = {
      sectionType: selectedSectionType,
      variant: selectedVariant,
      initialFields: {} as Record<string, unknown>
    };

    // Add initial fields for non-project sections
    if (selectedSectionType !== "project" && (title || description)) {
      payload.initialFields = {
        ...(title && { title }),
        ...(description && { description })
      };
    }

    onConfirm(payload);
  };

  const getSectionTypeDescription = (sectionType: EditorSectionType) => {
    const descriptions = {
      profileHeader: "Header section with name, photo, and contact info",
      about: "About section with personal description and background",
      project: "Project showcase with images, links, and details",
      skillGroup: "Group of related skills or technologies",
      socialLinks: "Social media and contact links",
      markdown: "Free-form markdown content"
    };
    return descriptions[sectionType] || "";
  };

  const getVariantDescription = (variant: string) => {
    const descriptions: Record<string, string> = {
      minimal: "Clean, simple layout with minimal elements",
      "photo-left": "Layout with photo positioned on the left side",
      "text-only": "Text-only layout without images",
      "text+image-right": "Text with image positioned on the right",
      "2x2": "2x2 grid layout for showcasing multiple items",
      carousel: "Horizontal scrolling carousel layout",
      chips: "Tag-style chips layout for skills",
      "grouped-columns": "Organized columns grouping related items",
      inline: "Horizontal inline layout",
      centered: "Centered layout with emphasis"
    };
    return descriptions[variant] || "Custom presentation variant";
  };

  const showInitialFields = selectedSectionType && 
    !["project", "socialLinks"].includes(selectedSectionType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add to {zone.label}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {/* Step 1: Choose Section Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Choose Content Type
              </h3>
              <div className="space-y-3">
                {zone.allowed.map((sectionType) => (
                  <label
                    key={sectionType}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSectionType === sectionType
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sectionType"
                      value={sectionType}
                      checked={selectedSectionType === sectionType}
                      onChange={(e) => setSelectedSectionType(e.target.value as EditorSectionType)}
                      className="sr-only"
                    />
                    <div className="font-medium text-gray-900 capitalize mb-1">
                      {sectionType.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getSectionTypeDescription(sectionType)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Variant and Initial Fields */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configure Presentation
              </h3>
              
              {/* Variant Selection */}
              {zone.variants && zone.variants.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Presentation Style
                    <span className="text-xs text-gray-500 ml-2">
                      (affects how content is displayed)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {zone.variants.map((variant) => (
                      <label
                        key={variant}
                        className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVariant === variant
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="variant"
                          value={variant}
                          checked={selectedVariant === variant}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-medium text-gray-900 capitalize mb-1">
                          {variant}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getVariantDescription(variant)}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Initial Fields */}
              {showInitialFields && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Initial Content (Optional)
                  </h4>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <div>
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!selectedSectionType}
                  className={`px-4 py-2 rounded-md ${
                    selectedSectionType
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={!selectedSectionType}
                  className={`px-4 py-2 rounded-md ${
                    selectedSectionType
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Section
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
