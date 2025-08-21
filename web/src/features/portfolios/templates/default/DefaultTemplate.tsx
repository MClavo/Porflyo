import type { PublicPortfolioView } from '../../../../types/dto';

interface DefaultTemplateProps {
  portfolio: PublicPortfolioView;
}

// Helper to safely extract string properties from section
function getSectionProperty(section: Record<string, unknown>, key: string): string | null {
  const value = section[key];
  return typeof value === 'string' ? value : null;
}

/**
 * Default portfolio template - vertical stack layout with responsive design
 * Shows images if present, clean professional look
 */
export function DefaultTemplate({ portfolio }: DefaultTemplateProps) {
  const { title, description, sections } = portfolio;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {sections && sections.length > 0 ? (
          <div className="space-y-8">
            {sections.map((section, index) => {
              const sectionTitle = getSectionProperty(section, 'title');
              const sectionContent = getSectionProperty(section, 'content');
              const sectionImageUrl = getSectionProperty(section, 'imageUrl');

              return (
                <section
                  key={index}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  {/* Section Title */}
                  {sectionTitle && (
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      {sectionTitle}
                    </h2>
                  )}

                  {/* Section Content */}
                  <div className="prose prose-gray max-w-none">
                    {sectionContent && (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {sectionContent}
                      </div>
                    )}

                    {/* Section Image */}
                    {sectionImageUrl && (
                      <div className="mt-4">
                        <img
                          src={sectionImageUrl}
                          alt={sectionTitle || 'Section image'}
                          className="w-full max-w-2xl rounded-lg shadow-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No sections available</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built with Porflyo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
