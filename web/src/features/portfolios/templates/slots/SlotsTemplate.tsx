import type { PublicPortfolioView } from '../../../../types/dto';

interface SlotsTemplateProps {
  portfolio: PublicPortfolioView;
}

// Helper to safely extract string properties from section
function getSectionProperty(section: Record<string, unknown>, key: string): string | null {
  const value = section[key];
  return typeof value === 'string' ? value : null;
}

/**
 * Slots portfolio template - rows that can host 2-3 sections horizontally
 * On mobile collapses to vertical. Modern card-based grid layout with gradients
 */
export function SlotsTemplate({ portfolio }: SlotsTemplateProps) {
  const { title, description, sections } = portfolio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero section */}
      <header className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Flexible slots grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {sections && sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => {
              const sectionTitle = getSectionProperty(section, 'title');
              const sectionContent = getSectionProperty(section, 'content');
              const sectionImageUrl = getSectionProperty(section, 'imageUrl');

              return (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20"
                >
                  {/* Card gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Section Image */}
                  {sectionImageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={sectionImageUrl}
                        alt={sectionTitle || 'Section image'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="relative p-6">
                    {/* Section Title */}
                    {sectionTitle && (
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                        {sectionTitle}
                      </h3>
                    )}

                    {/* Section Content */}
                    {sectionContent && (
                      <div className="text-gray-600 leading-relaxed">
                        <p className="line-clamp-4">
                          {sectionContent.length > 150 
                            ? `${sectionContent.substring(0, 150)}...` 
                            : sectionContent
                          }
                        </p>
                      </div>
                    )}

                    {/* Card accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <p className="text-gray-600 text-lg">No sections available</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Powered by Porflyo</p>
        </div>
      </footer>
    </div>
  );
}
