import { useState } from 'react';
import { DndPortfolioEditor } from './DndPortfolioEditorIndex';
import type { SectionConfig, PortfolioItem } from '../types/itemDto';
import type { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Example/Test component for the new DnD Portfolio Editor
 */
export function DndPortfolioEditorExample() {
  // Example initial data
  const [sections, setSections] = useState<SectionConfig[]>([
    {
      id: 'section-1',
      title: 'Personal Information',
      sectionType: 'user',
      allowedItemTypes: ['text', 'character'],
      maxItems: 10,
      items: [
        {
          id: 1,
          type: 'text',
          text: 'John Doe'
        },
        {
          id: 2,
          type: 'character',
          character: '@'
        },
        {
          id: 3,
          type: 'text',
          text: 'john@example.com'
        }
      ],
      nextId: 4
    },
    {
      id: 'section-2',
      title: 'Skills',
      sectionType: 'projects',
      allowedItemTypes: ['text', 'doubleText'],
      maxItems: 5,
      items: [
        {
          id: 5,
          type: 'doubleText',
          text1: 'JavaScript',
          text2: 'Advanced'
        },
        {
          id: 6,
          type: 'doubleText',
          text1: 'React',
          text2: 'Expert'
        }
      ],
      nextId: 7
    },
    {
      id: 'section-3',
      title: 'Notes',
      sectionType: 'projects',
      allowedItemTypes: ['text'],
      maxItems: 20,
      items: [
        {
          id: 8,
          type: 'text',
          text: 'Remember to update portfolio'
        }
      ],
      nextId: 9
    }
  ]);

  const handleSectionsChange = (newSections: SectionConfig[]) => {
    console.log('Sections updated:', newSections);
    setSections(newSections);
  };

  const handleItemChange = (itemId: UniqueIdentifier, newData: Partial<PortfolioItem>) => {
    console.log('Item changed:', itemId, newData);
  };

  const handleItemDelete = (itemId: UniqueIdentifier) => {
    console.log('Item deleted:', itemId);
  };

  const handleSectionAction = (sectionId: string, action: string) => {
    console.log('Section action:', sectionId, action);
    
    if (action === 'add') {
      // Add a new text item to the section
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const newItem: PortfolioItem = {
          id: section.nextId,
          type: 'text',
          text: `New item ${section.nextId}`
        };
        
        const updatedSections = sections.map(s => 
          s.id === sectionId 
            ? { 
                ...s, 
                items: [...s.items, newItem],
                nextId: s.nextId + 1
              }
            : s
        );
        
        setSections(updatedSections);
      }
    } else if (action === 'delete') {
      // Remove the section (with confirmation in real app)
      const updatedSections = sections.filter(s => s.id !== sectionId);
      setSections(updatedSections);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>DnD Portfolio Editor Example</h1>
      <p>Drag items within sections or between sections. Use the + button to add items.</p>
      
      <DndPortfolioEditor
        sections={sections}
        onSectionsChange={handleSectionsChange}
        onItemChange={handleItemChange}
        onItemDelete={handleItemDelete}
        onSectionAction={handleSectionAction}
        className="example-editor"
      />
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Current State (Debug):</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(sections, null, 2)}
        </pre>
      </div>
    </div>
  );
}
