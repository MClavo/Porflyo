import type { EditItemProps, GithubProjectItem } from '../../../types/itemDto';
import './GithubProjectItem.css';

export function GithubProjectItem({
  item,
  editable = false,
  onStartEdit,
  className = '',
  style,
}: EditItemProps) {
  if (!item || item.type !== 'githubProject') {
    return <div className={className} style={style}>Invalid GitHub project item</div>;
  }

  const githubItem = item as GithubProjectItem;

  const handleClick = () => {
    if (editable && onStartEdit) {
      onStartEdit();
    }
  };

  return (
    <div 
      className={`github-project-item ${className}`}
      style={style}
      onClick={handleClick}
    >
      {/* Project Header */}
      <div className="github-project-header">
        <h3 className="github-project-name">{githubItem.name}</h3>
        <div className="github-project-stats">
          {githubItem.showStars && githubItem.stars && githubItem.stars > 0 && (
            <div className="github-project-stat">
              <span className="github-project-stat-icon">⭐</span>
              <span>{githubItem.stars}</span>
            </div>
          )}
          {githubItem.showForks && githubItem.forks && githubItem.forks > 0 && (
            <div className="github-project-stat">
              <span className="github-project-stat-icon">🍴</span>
              <span>{githubItem.forks}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Images */}
      {githubItem.images && githubItem.images.length > 0 && (
        <div className="github-project-carousel">
          <img
            src={githubItem.images[0]}
            alt={`${githubItem.name} preview`}
            className="github-project-image"
          />
        </div>
      )}

      {/* Project Description */}
      {githubItem.description && (
        <div className="github-project-description">
          {githubItem.description}
        </div>
      )}

      {/* Project Topics */}
      {githubItem.topics && githubItem.topics.length > 0 && (
        <div className="github-project-topics">
          {githubItem.topics.slice(0, 4).map((topic, index) => (
            <span key={index} className="github-project-topic">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Project Links */}
      <div className="github-project-links">
        <a
          href={githubItem.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="github-project-link primary"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="github-project-link-icon">📁</span>
          <span>Ver Código</span>
        </a>
        
        {githubItem.homepage && (
          <a
            href={githubItem.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="github-project-link"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="github-project-link-icon">🔗</span>
            <span>Demo</span>
          </a>
        )}
      </div>
    </div>
  );
}
