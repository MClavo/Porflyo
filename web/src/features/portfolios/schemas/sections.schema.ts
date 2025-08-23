import { z } from 'zod';
import { SECTION_LIMITS } from '../types/sectionsOLD';

/**
 * Base section schema
 */
const baseSectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  position: z.number().min(0, 'Position must be non-negative'),
});

/**
 * Link schema for sections that support links
 */
const linkSchema = z.object({
  text: z.string().min(1, 'Link text is required').max(50, 'Link text must be 50 characters or less'),
  url: z.string().url('Must be a valid URL'),
});

/**
 * About section schema
 */
export const aboutSectionSchema = baseSectionSchema.extend({
  kind: z.literal('ABOUT'),
  avatar: z.string().url('Must be a valid URL').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  socials: z.record(z.string(), z.string().url('Must be a valid URL')),
  email: z.string().email('Must be a valid email'),
  showUserDescription: z.boolean(),
});

/**
 * Text section schema
 */
export const textSectionSchema = baseSectionSchema.extend({
  kind: z.literal('TEXT'),
  title: z.string().min(1, 'Title is required').max(SECTION_LIMITS.MAX_TITLE_LENGTH, `Title must be ${SECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`),
  content: z.string().min(1, 'Content is required').max(SECTION_LIMITS.MAX_CONTENT_LENGTH, `Content must be ${SECTION_LIMITS.MAX_CONTENT_LENGTH} characters or less`),
  links: z.array(linkSchema).max(SECTION_LIMITS.MAX_LINKS_PER_SECTION, `Maximum ${SECTION_LIMITS.MAX_LINKS_PER_SECTION} links allowed`).optional(),
});

/**
 * Text with image section schema
 */
export const textWithImageSectionSchema = baseSectionSchema.extend({
  kind: z.enum(['TEXT_WITH_IMAGE_LEFT', 'TEXT_WITH_IMAGE_RIGHT']),
  title: z.string().min(1, 'Title is required').max(SECTION_LIMITS.MAX_TITLE_LENGTH, `Title must be ${SECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`),
  content: z.string().min(1, 'Content is required').max(SECTION_LIMITS.MAX_CONTENT_LENGTH, `Content must be ${SECTION_LIMITS.MAX_CONTENT_LENGTH} characters or less`),
  image: z.string().url('Must be a valid image URL'),
  links: z.array(linkSchema).max(SECTION_LIMITS.MAX_LINKS_PER_SECTION, `Maximum ${SECTION_LIMITS.MAX_LINKS_PER_SECTION} links allowed`).optional(),
});

/**
 * Repository section schema
 */
export const repoSectionSchema = baseSectionSchema.extend({
  kind: z.literal('REPO'),
  repoId: z.string().min(1, 'Repository is required'),
});

/**
 * Repository list section schema
 */
export const repoListSectionSchema = baseSectionSchema.extend({
  kind: z.literal('REPO_LIST'),
  repoIds: z.array(z.string().min(1, 'Repository ID is required')).min(1, 'At least one repository is required').max(10, 'Maximum 10 repositories allowed'),
});

/**
 * Gallery section schema
 */
export const gallerySectionSchema = baseSectionSchema.extend({
  kind: z.enum(['GALLERY_LARGE', 'GALLERY_SMALL', 'GALLERY_GRID']),
  images: z.array(z.string().url('Must be a valid image URL')).min(1, 'At least one image is required').max(20, 'Maximum 20 images per gallery'),
});

/**
 * Union schema for all section types
 */
export const sectionSchema = z.discriminatedUnion('kind', [
  aboutSectionSchema,
  textSectionSchema,
  textWithImageSectionSchema,
  repoSectionSchema,
  repoListSectionSchema,
  gallerySectionSchema,
]);

/**
 * Portfolio form schema
 */
export const portfolioFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(SECTION_LIMITS.MAX_TITLE_LENGTH, `Title must be ${SECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`),
  template: z.string().min(1, 'Template is required'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug must be 50 characters or less'),
  published: z.boolean(),
  sections: z.array(sectionSchema)
    .min(1, 'At least one section (About) is required')
    .max(SECTION_LIMITS.MAX_SECTIONS, `Maximum ${SECTION_LIMITS.MAX_SECTIONS} sections allowed`)
    .refine((sections) => {
      // First section must be ABOUT
      return sections.length > 0 && sections[0].kind === 'ABOUT';
    }, 'First section must be About')
    .refine((sections) => {
      // Only one ABOUT section allowed
      const aboutSections = sections.filter(s => s.kind === 'ABOUT');
      return aboutSections.length === 1;
    }, 'Only one About section is allowed')
    .refine((sections) => {
      // Check global image limit
      let totalImages = 0;
      sections.forEach(section => {
        if (section.kind === 'TEXT_WITH_IMAGE_LEFT' || section.kind === 'TEXT_WITH_IMAGE_RIGHT') {
          totalImages += 1;
        } else if (section.kind === 'GALLERY_LARGE' || section.kind === 'GALLERY_SMALL' || section.kind === 'GALLERY_GRID') {
          totalImages += section.images.length;
        }
      });
      return totalImages <= SECTION_LIMITS.MAX_IMAGES_PER_PORTFOLIO;
    }, `Maximum ${SECTION_LIMITS.MAX_IMAGES_PER_PORTFOLIO} images allowed per portfolio (excluding avatar)`),
});

/**
 * Type inference
 */
export type AboutSectionFormData = z.infer<typeof aboutSectionSchema>;
export type TextSectionFormData = z.infer<typeof textSectionSchema>;
export type TextWithImageSectionFormData = z.infer<typeof textWithImageSectionSchema>;
export type RepoSectionFormData = z.infer<typeof repoSectionSchema>;
export type RepoListSectionFormData = z.infer<typeof repoListSectionSchema>;
export type GallerySectionFormData = z.infer<typeof gallerySectionSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type PortfolioFormData = z.infer<typeof portfolioFormSchema>;
