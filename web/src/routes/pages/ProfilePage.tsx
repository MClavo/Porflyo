import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';
import { useUpdateUser } from '../../features/auth/hooks/useUpdateUser';
import type { UserPatchDto } from '../../types/dto';

// Schema matching UserPatchDto.java - all fields optional
const profileFormSchema = z.object({
  name: z.string().max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email format').max(100, 'Email must be 100 characters or less').or(z.literal('')),
  description: z.string().max(500, 'Description must be 500 characters or less'),
  avatarUrl: z.string().url('Invalid URL format').or(z.literal('')),
  // Socials as individual fields for better UX
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  twitterUrl: z.string().url('Invalid Twitter URL').or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuthUser();
  const updateUserMutation = useUpdateUser();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      description: user?.description || '',
      avatarUrl: user?.providerAvatarUrl || '',
      githubUrl: user?.socials?.github || '',
      linkedinUrl: user?.socials?.linkedin || '',
      twitterUrl: user?.socials?.twitter || '',
      websiteUrl: user?.socials?.website || '',
    },
    // Reset form when user data loads
    values: user ? {
      name: user.name || '',
      email: user.email || '',
      description: user.description || '',
      avatarUrl: user.providerAvatarUrl || '',
      githubUrl: user.socials?.github || '',
      linkedinUrl: user.socials?.linkedin || '',
      twitterUrl: user.socials?.twitter || '',
      websiteUrl: user.socials?.website || '',
    } : undefined,
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Transform form data to UserPatchDto format, filtering out empty strings
      const updates: UserPatchDto = {};
      
      if (data.name && data.name.trim()) updates.name = data.name.trim();
      if (data.email && data.email.trim()) updates.email = data.email.trim();
      if (data.description && data.description.trim()) updates.description = data.description.trim();
      if (data.avatarUrl && data.avatarUrl.trim()) updates.avatarUrl = data.avatarUrl.trim();
      
      // Build socials object only if there are social URLs
      const socials: Record<string, string> = {};
      if (data.githubUrl && data.githubUrl.trim()) socials.github = data.githubUrl.trim();
      if (data.linkedinUrl && data.linkedinUrl.trim()) socials.linkedin = data.linkedinUrl.trim();
      if (data.twitterUrl && data.twitterUrl.trim()) socials.twitter = data.twitterUrl.trim();
      if (data.websiteUrl && data.websiteUrl.trim()) socials.website = data.websiteUrl.trim();
      
      if (Object.keys(socials).length > 0) {
        updates.socials = socials;
      }

      await updateUserMutation.mutateAsync(updates);
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Error handling is done by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="toast success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50 }}>
            <div style={{ display: 'flex' }}>
              <div style={{ paddingTop: '0.25rem' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--success-color)', marginRight: '1rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 'bold' }}>Profile updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Edit Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Basic Information</h2>
            </div>
            <div>
              <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Your display name"
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className={`form-input ${errors.description ? 'error' : ''}`}
                  placeholder="Tell us about yourself..."
                />
                {errors.description && (
                  <p className="error-message">{errors.description.message}</p>
                )}
              </div>

              {/* Avatar URL */}
              <div className="form-group">
                <label htmlFor="avatarUrl" className="form-label">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  {...register('avatarUrl')}
                  className={`form-input ${errors.avatarUrl ? 'error' : ''}`}
                  placeholder="https://example.com/avatar.jpg"
                />
                {errors.avatarUrl && (
                  <p className="error-message">{errors.avatarUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Social Links</h2>
            </div>
            <div>
              <div className="form-grid">
                {/* GitHub */}
                <div className="form-group">
                  <label htmlFor="githubUrl" className="form-label">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    {...register('githubUrl')}
                    className={`form-input ${errors.githubUrl ? 'error' : ''}`}
                    placeholder="https://github.com/username"
                  />
                  {errors.githubUrl && (
                    <p className="error-message">{errors.githubUrl.message}</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="form-group">
                  <label htmlFor="linkedinUrl" className="form-label">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    {...register('linkedinUrl')}
                    className={`form-input ${errors.linkedinUrl ? 'error' : ''}`}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedinUrl && (
                    <p className="error-message">{errors.linkedinUrl.message}</p>
                  )}
                </div>

                {/* Twitter */}
                <div className="form-group">
                  <label htmlFor="twitterUrl" className="form-label">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    id="twitterUrl"
                    {...register('twitterUrl')}
                    className={`form-input ${errors.twitterUrl ? 'error' : ''}`}
                    placeholder="https://twitter.com/username"
                  />
                  {errors.twitterUrl && (
                    <p className="error-message">{errors.twitterUrl.message}</p>
                  )}
                </div>

                {/* Website */}
                <div className="form-group">
                  <label htmlFor="websiteUrl" className="form-label">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    {...register('websiteUrl')}
                    className={`form-input ${errors.websiteUrl ? 'error' : ''}`}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.websiteUrl && (
                    <p className="error-message">{errors.websiteUrl.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || isSubmitting}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!isDirty || isSubmitting || updateUserMutation.isPending}
              className="btn"
            >
              {isSubmitting || updateUserMutation.isPending ? (
                <>
                  <svg className="spinner" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Error message */}
          {updateUserMutation.isError && (
            <div className="error">
              <p style={{ fontWeight: 'bold' }}>Error updating profile</p>
              <p>{updateUserMutation.error?.message || 'An unexpected error occurred. Please try again.'}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
