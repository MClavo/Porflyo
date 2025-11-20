/**
 * ProjectRankingCard - Card showing top performing projects ranking
 */

import { FiTrendingUp, FiCode, FiExternalLink } from 'react-icons/fi';

interface ProjectRankingCardProps {
  data: Array<{
    projectId: number;
    projectName?: string;
    totalInteractions: number;
    totalCodeViews: number;
    totalLiveViews: number;
    interactionRate: number;
    totalExposures: number;
  }>;
  title: string;
  subtitle: string;
}

export const ProjectRankingCard: React.FC<ProjectRankingCardProps> = ({
  data,
  title,
  subtitle
}) => {
  // Sort by total interactions (already sorted from parent, but ensure it)
  const sortedData = [...data].sort((a, b) => b.totalInteractions - a.totalInteractions);

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return 'var(--text-secondary)';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      border: '1px solid var(--card-border)',
      height: 'fit-content'
    }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          fontSize: 'var(--font-lg)', 
          fontWeight: 600, 
          margin: 0,
          marginBottom: 'var(--space-1)'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--font-sm)', 
          margin: 0 
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {sortedData.map((project, index) => (
          <div 
            key={project.projectId}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: index < 3 ? 'rgba(59, 130, 246, 0.05)' : 'var(--dashboard-bg-secondary)',
              border: '1px solid var(--card-border)',
              transition: 'all 0.2s ease',
              gap: 'var(--space-4)'
            }}
          >
            {/* Rank */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '48px',
              fontSize: index < 3 ? 'var(--font-xl)' : 'var(--font-lg)',
              fontWeight: 600,
              color: getRankColor(index)
            }}>
              {getRankIcon(index)}
            </div>

            {/* Project Info */}
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)' 
            }}>
              {/* Project Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: 'var(--font-lg)',
                  lineHeight: 1.2
                }}>
                  {project.projectName || `Project ${project.projectId}`}
                </span>
                <FiTrendingUp size={14} color="var(--accent-green)" />
              </div>
              
              {/* Views Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                alignItems: 'center'
              }}>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  <FiCode size={12} />
                  <span>{project.totalCodeViews} code</span>
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  <FiExternalLink size={12} />
                  <span>{project.totalLiveViews} live</span>
                </span>
              </div>

              {/* Metrics Row */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-sm)', 
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Social Conv
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {(project.interactionRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Social Reach
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {project.totalExposures.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Interactions */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap : 'var(--space-1)',
              justifyContent: 'center',
              minWidth: '80px',
              paddingLeft: 'var(--space-3)',
              borderLeft: '1px solid var(--card-border)'
            }}>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontWeight: 700,
                fontSize: 'var(--font-xl)',
                lineHeight: 1.2
              }}>
                {project.totalInteractions.toLocaleString()}
              </div>
              <div style={{ 
                color: 'var(--text-tertiary)', 
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '2px'
              }}>
                total
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          color: 'var(--text-secondary)'
        }}>
          <p>No project data available</p>
        </div>
      )}
    </div>
  );
};

export default ProjectRankingCard;