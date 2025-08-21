import { useFormContext } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';
import { useAuthUser } from '../../auth/hooks/useAuthUser';

interface AboutSectionEditorProps {
  sectionIndex: number;
}

export function AboutSectionEditor({ sectionIndex }: AboutSectionEditorProps) {
  const { user } = useAuthUser();
  const { register, formState: { errors }, watch } = useFormContext<PortfolioFormData>();
  
  const sectionPath = `sections.${sectionIndex}` as const;
  const showUserDescription = watch(`${sectionPath}.showUserDescription`);
  
  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    const sectionErrors = errors.sections?.[sectionIndex];
    return sectionErrors?.[field as keyof typeof sectionErrors] as { message?: string } | undefined;
  };

  return (
    <div className="form-container">
      {/* Avatar */}
      <div className="form-group">
        <label className="form-label">Avatar</label>
        <div className="avatar-selector">
          <div className="avatar-preview">
            <img
              src={user?.profileImage || user?.providerAvatarUrl || ''}
              alt="Avatar"
              className="user-avatar"
              style={{ width: '4rem', height: '4rem' }}
            />
          </div>
          <input
            type="url"
            {...register(`${sectionPath}.avatar`)}
            className={`form-input ${getFieldError('avatar') ? 'error' : ''}`}
            placeholder="Custom avatar URL (optional)"
          />
        </div>
        {getFieldError('avatar') && (
          <p className="error-message">{getFieldError('avatar')?.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-name`} className="form-label">
          Name *
        </label>
        <input
          type="text"
          id={`section-${sectionIndex}-name`}
          {...register(`${sectionPath}.name`)}
          className={`form-input ${getFieldError('name') ? 'error' : ''}`}
          placeholder="Your display name"
        />
        {getFieldError('name') && (
          <p className="error-message">{getFieldError('name')?.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-email`} className="form-label">
          Email *
        </label>
        <input
          type="email"
          id={`section-${sectionIndex}-email`}
          {...register(`${sectionPath}.email`)}
          className={`form-input ${getFieldError('email') ? 'error' : ''}`}
          placeholder="your.email@example.com"
        />
        {getFieldError('email') && (
          <p className="error-message">{getFieldError('email')?.message}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="form-group">
        <label className="form-label">Social Links</label>
        <div className="social-links-editor">
          <div className="form-grid">
            <div>
              <label htmlFor={`section-${sectionIndex}-github`} className="form-label">
                GitHub
              </label>
              <input
                type="url"
                id={`section-${sectionIndex}-github`}
                {...register(`${sectionPath}.socials.github`)}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label htmlFor={`section-${sectionIndex}-linkedin`} className="form-label">
                LinkedIn
              </label>
              <input
                type="url"
                id={`section-${sectionIndex}-linkedin`}
                {...register(`${sectionPath}.socials.linkedin`)}
                className="form-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label htmlFor={`section-${sectionIndex}-twitter`} className="form-label">
                Twitter
              </label>
              <input
                type="url"
                id={`section-${sectionIndex}-twitter`}
                {...register(`${sectionPath}.socials.twitter`)}
                className="form-input"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label htmlFor={`section-${sectionIndex}-website`} className="form-label">
                Website
              </label>
              <input
                type="url"
                id={`section-${sectionIndex}-website`}
                {...register(`${sectionPath}.socials.website`)}
                className="form-input"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Show User Description Toggle */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            {...register(`${sectionPath}.showUserDescription`)}
            className="checkbox-input"
          />
          <span className="checkbox-text">Show user description</span>
        </label>
        {showUserDescription && user?.description && (
          <p className="user-description-preview">
            <strong>Preview:</strong> {user.description}
          </p>
        )}
      </div>
    </div>
  );
}
