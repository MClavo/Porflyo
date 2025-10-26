/**
 * Type definition for About section data
 * This is stored as JSON in PortfolioSection.content
 */
export interface AboutSectionData {
  name: string;
  email: string;
  description: string;
  profileImage?: string | null;
  profileImageKey?: string;
  socials?: Record<string, string>;
  
  // Optional metadata for template-specific configuration
  // e.g., { bgColor: '#000000', theme: 'dark' }
  templateConfig?: Record<string, unknown>;
}

/**
 * Creates default/empty AboutSectionData
 */
export function createDefaultAboutData(): AboutSectionData {
  return {
    name: '',
    email: '',
    description: '',
    profileImage: null,
    profileImageKey: '',
    socials: {},
    templateConfig: {},
  };
}

/**
 * Safely parse AboutSectionData from JSON string
 * Returns default data if parsing fails
 */
export function parseAboutSectionData(content: string): AboutSectionData {
  if (!content || content.trim() === '') {
    return createDefaultAboutData();
  }
  
  try {
    const parsed = JSON.parse(content);
    // Ensure all required fields exist
    return {
      name: parsed.name || '',
      email: parsed.email || '',
      description: parsed.description || '',
      profileImage: parsed.profileImage || null,
      profileImageKey: parsed.profileImageKey || '',
      socials: parsed.socials || {},
      templateConfig: parsed.templateConfig || {},
    };
  } catch (err) {
    console.warn('Failed to parse about section data, using defaults:', err);
    // Fallback: treat as plain text description
    return {
      ...createDefaultAboutData(),
      description: content,
    };
  }
}

/**
 * Serialize AboutSectionData to JSON string for backend
 */
export function serializeAboutSectionData(data: AboutSectionData): string {
  return JSON.stringify(data);
}
