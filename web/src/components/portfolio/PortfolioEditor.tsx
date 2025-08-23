import React, { useState, useEffect } from "react";
import type { 
  PublicUserDto, 
  PublicPortfolioDto, 
  PortfolioCreateDto, 
  PortfolioPatchDto, 
  ProviderRepo,
  PortfolioSection 
} from "../../types/dto";
import type { 
  Template, 
  PortfolioDraft, 
  EditorSectionType 
} from "./types";
import { 
  TEMPLATE_REGISTRY, 
  getDefaultTemplateId, 
  getTemplateById 
} from "../../templates";
import { TemplateThemeProvider } from "../../templates/ThemeProvider";
import { 
  initDraftFromTemplate, 
  switchTemplate, 
  buildCreateDto, 
  buildPatchDto,
  writeMeta 
} from "./utils";
import { ZoneRenderer } from "./ZoneRenderer";
import { AddSectionDialog } from "./AddSectionDialog";
import { RepoPickerDialog } from "./RepoPickerDialog";
import { ProjectFormDialog } from "./ProjectFormDialog";

type ExtendedRepo = ProviderRepo & {
  topics?: string[];
  homepage?: string;
  stargazers_count?: number;
  language?: string;
};

interface PortfolioEditorProps {
  user: PublicUserDto;
  initialTemplateId?: string;
  initialPortfolio?: PublicPortfolioDto | null;
  loadUserRepos: () => Promise<ExtendedRepo[]>;
  onSave?: (dto: PortfolioCreateDto | PortfolioPatchDto) => Promise<void>;
  mode?: "create" | "edit";
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  user,
  initialTemplateId,
  initialPortfolio,
  loadUserRepos,
  onSave,
  mode = "create"
}) => {
  // Get initial template
  const getInitialTemplate = (): Template => {
    const templateId = initialTemplateId || 
                      initialPortfolio?.template || 
                      getDefaultTemplateId();
    return getTemplateById(templateId) || getTemplateById(getDefaultTemplateId())!;
  };

  // State
  const [currentTemplate, setCurrentTemplate] = useState<Template>(getInitialTemplate);
  const [draft, setDraft] = useState<PortfolioDraft>(() => 
    initDraftFromTemplate(currentTemplate, initialPortfolio)
  );
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [addSectionDialog, setAddSectionDialog] = useState<{
    open: boolean;
    zoneId: string;
  }>({ open: false, zoneId: "" });

  const [repoPickerDialog, setRepoPickerDialog] = useState<{
    open: boolean;
    targetZoneId: string;
    variant: string;
  }>({ open: false, targetZoneId: "", variant: "" });

  const [projectFormDialog, setProjectFormDialog] = useState<{
    open: boolean;
    repo: ExtendedRepo | null;
    targetZoneId: string;
    variant: string;
  }>({ open: false, repo: null, targetZoneId: "", variant: "" });

  // Update draft when template changes
  useEffect(() => {
    setDraft(initDraftFromTemplate(currentTemplate, initialPortfolio));
  }, [currentTemplate, initialPortfolio]);

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const newTemplate = getTemplateById(templateId);
    if (!newTemplate) return;

    const { next } = switchTemplate(draft, currentTemplate, newTemplate);
    setCurrentTemplate(newTemplate);
    setDraft(next);
  };

  // Handle adding item to zone
  const handleAddItem = (zoneId: string) => {
    const zone = currentTemplate.zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Check if zone is at capacity
    const currentItems = draft.zones[zoneId]?.items || [];
    if (zone.maxItems && currentItems.length >= zone.maxItems) {
      alert(`This zone is full. Maximum ${zone.maxItems} items allowed.`);
      return;
    }

    setAddSectionDialog({ open: true, zoneId });
  };

  // Handle section type selection from AddSectionDialog
  const handleSectionTypeConfirm = (payload: {
    sectionType: EditorSectionType;
    variant: string;
    initialFields?: Record<string, unknown>;
  }) => {
    const zoneId = addSectionDialog.zoneId;
    const zone = currentTemplate.zones.find(z => z.id === zoneId);
    if (!zone) return;

    setAddSectionDialog({ open: false, zoneId: "" });

    if (payload.sectionType === "project") {
      // Open repo picker for projects
      setRepoPickerDialog({
        open: true,
        targetZoneId: zoneId,
        variant: payload.variant
      });
    } else {
      // Create minimal section for other types
      const section: PortfolioSection = {
        ...(payload.initialFields || {}),
        title: payload.initialFields?.title || "New Section",
        description: payload.initialFields?.description || "",
        content: payload.initialFields?.description || ""
      };

      const sectionWithMeta = writeMeta(section, {
        sectionType: payload.sectionType,
        zoneId: zoneId,
        zoneType: zone.zoneType,
        variant: payload.variant,
        version: 1
      });

      // Add to draft
      setDraft(prev => ({
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: {
            ...prev.zones[zoneId],
            items: [...(prev.zones[zoneId]?.items || []), sectionWithMeta]
          }
        }
      }));
    }
  };

  // Handle repo selection
  const handleRepoConfirm = (repo: ExtendedRepo) => {
    setRepoPickerDialog({ open: false, targetZoneId: "", variant: "" });
    setProjectFormDialog({
      open: true,
      repo,
      targetZoneId: repoPickerDialog.targetZoneId,
      variant: repoPickerDialog.variant
    });
  };

  // Handle project form submission
  const handleProjectConfirm = (section: PortfolioSection) => {
    const zoneId = projectFormDialog.targetZoneId;
    setProjectFormDialog({ open: false, repo: null, targetZoneId: "", variant: "" });

    // Add to draft
    setDraft(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zoneId]: {
          ...prev.zones[zoneId],
          items: [...(prev.zones[zoneId]?.items || []), section]
        }
      }
    }));
  };

  // Handle variant change
  const handleChangeVariant = (zoneId: string, variant: string) => {
    setDraft(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zoneId]: {
          ...prev.zones[zoneId],
          variant
        }
      }
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      let dto: PortfolioCreateDto | PortfolioPatchDto;
      
      if (mode === "create") {
        // TODO: Get actual title and description from form inputs
        dto = buildCreateDto(draft, "My Portfolio", "Portfolio description");
      } else {
        // TODO: Get partial updates from form inputs
        dto = buildPatchDto(draft, {});
      }

      await onSave(dto);
    } catch (error) {
      console.error("Failed to save portfolio:", error);
      alert("Failed to save portfolio. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portfolio-editor flex h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Settings</h2>
          
          {/* Template Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template
            </label>
            <div className="space-y-2">
              {Object.values(TEMPLATE_REGISTRY).map((template) => (
                <label
                  key={template.id}
                  className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={currentTemplate.id === template.id}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-600">
                    {template.zones.length} zones • v{template.version}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* TODO: Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
              TODO: Title input
            </div>
          </div>

          {/* TODO: Slug Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
              TODO: Slug input
            </div>
          </div>

          {/* TODO: Visibility Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
              TODO: Visibility toggle
            </div>
          </div>
        </div>

        {/* Save Button */}
        {onSave && (
          <div className="p-6 mt-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-4 py-2 rounded-md font-medium ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : mode === "create" ? 'Create Portfolio' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 overflow-auto">
        <TemplateThemeProvider templateId={currentTemplate.id}>
          <div className="min-h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Portfolio Preview - {currentTemplate.name}
                </h1>
                {onSave && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-md font-medium ${
                      saving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Template Zones */}
            <div className="p-6 space-y-8">
              {currentTemplate.zones.map((zone) => (
                <ZoneRenderer
                  key={zone.id}
                  zone={zone}
                  zoneData={draft.zones[zone.id]}
                  user={user}
                  onAddItem={handleAddItem}
                  onChangeVariant={handleChangeVariant}
                  editorMode={true}
                />
              ))}
            </div>
          </div>
        </TemplateThemeProvider>
      </div>

      {/* Dialogs */}
      <AddSectionDialog
        open={addSectionDialog.open}
        zone={currentTemplate.zones.find(z => z.id === addSectionDialog.zoneId)!}
        currentVariant={draft.zones[addSectionDialog.zoneId]?.variant}
        onCancel={() => setAddSectionDialog({ open: false, zoneId: "" })}
        onConfirm={handleSectionTypeConfirm}
      />

      <RepoPickerDialog
        open={repoPickerDialog.open}
        onCancel={() => setRepoPickerDialog({ open: false, targetZoneId: "", variant: "" })}
        onConfirm={handleRepoConfirm}
        loadUserRepos={loadUserRepos}
      />

      <ProjectFormDialog
        open={projectFormDialog.open}
        fromRepo={projectFormDialog.repo}
        onCancel={() => setProjectFormDialog({ open: false, repo: null, targetZoneId: "", variant: "" })}
        onConfirm={handleProjectConfirm}
        defaultVariant={projectFormDialog.variant}
        targetZoneId={projectFormDialog.targetZoneId}
      />
    </div>
  );
};
