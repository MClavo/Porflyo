import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PortfolioSection, ProviderRepo } from "../../types/dto";
import { writeMeta } from "./types";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  repoUrl: z.string().url("Must be a valid URL"),
  demoUrl: z.string(),
  topics: z.string(),
  media: z.array(z.string())
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type ExtendedRepo = ProviderRepo & {
  topics?: string[];
  homepage?: string;
};

interface ProjectFormDialogProps {
  open: boolean;
  fromRepo: ExtendedRepo | null;
  onCancel: () => void;
  onConfirm: (section: PortfolioSection) => void;
  defaultVariant?: string;
  targetZoneId: string;
}

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  fromRepo,
  onCancel,
  onConfirm,
  defaultVariant = "2x2",
  targetZoneId
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      repoUrl: "",
      demoUrl: "",
      topics: "",
      media: []
    }
  });

  const mediaArray = watch("media");

  // Reset form when dialog opens with repo data
  useEffect(() => {
    if (open && fromRepo) {
      reset({
        title: fromRepo.name || "",
        description: fromRepo.description || "",
        repoUrl: fromRepo.html_url,
        demoUrl: fromRepo.homepage || "",
        topics: fromRepo.topics?.join(", ") || "",
        media: []
      });
    } else if (open && !fromRepo) {
      reset({
        title: "",
        description: "",
        repoUrl: "",
        demoUrl: "",
        topics: "",
        media: []
      });
    }
  }, [open, fromRepo, reset]);

  const onSubmit = (data: ProjectFormData) => {
    // Parse topics from comma-separated string
    const topicsArray = data.topics
      ? data.topics.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    // Build the portfolio section
    const section: PortfolioSection = {
      title: data.title,
      description: data.description || "",
      repoUrl: data.repoUrl,
      demoUrl: data.demoUrl || undefined,
      topics: topicsArray,
      media: data.media
    };

    // Add metadata
    const sectionWithMeta = writeMeta(section, {
      sectionType: "project",
      zoneId: targetZoneId,
      zoneType: "cards-grid",
      variant: defaultVariant,
      version: 1
    });

    onConfirm(sectionWithMeta);
  };

  const addMediaUrl = () => {
    setValue("media", [...mediaArray, ""]);
  };

  const removeMediaUrl = (index: number) => {
    const newMedia = mediaArray.filter((_, i) => i !== index);
    setValue("media", newMedia);
  };

  const updateMediaUrl = (index: number, url: string) => {
    const newMedia = [...mediaArray];
    newMedia[index] = url;
    setValue("media", newMedia);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {fromRepo ? `Add Project: ${fromRepo.name}` : "Add Project"}
              </h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter project title..."
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your project..."
                  />
                )}
              />
            </div>

            {/* Repository URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL *
              </label>
              <Controller
                name="repoUrl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    readOnly={!!fromRepo}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fromRepo ? "bg-gray-50 text-gray-600" : ""
                    } ${errors.repoUrl ? "border-red-500" : "border-gray-300"}`}
                    placeholder="https://github.com/username/repository"
                  />
                )}
              />
              {errors.repoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.repoUrl.message}</p>
              )}
            </div>

            {/* Demo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo URL
              </label>
              <Controller
                name="demoUrl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.demoUrl ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                )}
              />
              {errors.demoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.demoUrl.message}</p>
              )}
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics
                <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
              </label>
              <Controller
                name="topics"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="react, typescript, web-development"
                  />
                )}
              />
            </div>

            {/* Media URLs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Project Images
                </label>
                <button
                  type="button"
                  onClick={addMediaUrl}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Image
                </button>
              </div>
              <div className="space-y-3">
                {mediaArray.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMediaUrl(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {mediaArray.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No images added yet. Click "Add Image" to include project screenshots or demos.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className={`px-4 py-2 rounded-md ${
                  isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Project
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
