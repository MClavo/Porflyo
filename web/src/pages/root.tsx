import { Navigate } from 'react-router-dom';
import { LoginButton } from '../features/auth/components/LoginButton';
import { useAuthUser } from '../features/auth/hooks/useAuthUser';
import './keycaps.css';
import { GlassKeycapButton } from './keycap/GlassKeycapButton';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Root page (unauthenticated) — moved from HomePage
 */
export default function Root() {
  const { isAuthenticated } = useAuthUser();

  // State to manage the order of keycaps
  const [keycaps, setKeycaps] = useState([
    { id: 'P', glyph: 'P' },
    { id: 'O', glyph: 'O' },
    { id: 'R', glyph: 'R' },
    { id: 'F', glyph: 'F' },
    { id: 'L', glyph: 'L' },
    { id: 'Y', glyph: 'Y' },
    { id: 'O2', glyph: 'O' },
  ]);

  // activeId for DragOverlay
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setKeycaps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    // clear overlay at the end of drag so the moved element reappears in its new place
    setActiveId(null);
  };

  function SortableKeycap({ id, glyph, size }: { id: string; glyph: string; size: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      visibility: isDragging ? 'hidden' as const : undefined,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <GlassKeycapButton glyph={glyph} aria-label={`${glyph} key`} size={size} />
      </div>
    );
  }

  // If already authenticated, send the user to the authenticated home dashboard
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="main-content" >
        <div className="text-center">
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Create and publish your
            <span style={{ color: 'var(--primary-color)' }}> portfolio</span>
          </h1>
          <p className="text-lg mb-6" style={{ maxWidth: '48rem', margin: '0 auto 2rem auto', color: 'var(--text-secondary)' }}>
            Build beautiful, professional portfolios that showcase your work. 
            Connect your GitHub repositories and create multiple portfolio views 
            for different purposes.
          </p>

          
          

          {/* Keycaps with DnD */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragCancel={() => setActiveId(null)}>
             <SortableContext items={keycaps.map((keycap) => keycap.id)}>
               <div className="keycaps">
                 {keycaps.map(({ id, glyph }) => (
                   <SortableKeycap key={id} id={id} glyph={glyph} size={120} />
                 ))}
               </div>
             </SortableContext>
            <DragOverlay dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
              {activeId ? (() => {
                const item = keycaps.find(k => k.id === activeId);
                return item ? <GlassKeycapButton glyph={item.glyph} size={120} /> : null;
              })() : null}
            </DragOverlay>
           </DndContext>
              
           <div className="mb-6">
            <LoginButton className="btn btn-lg">
              Sign in with GitHub to get started
            </LoginButton>
          </div>

        </div>
      </div>

      {/* Testing Section */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="main-content">
          <div className="text-center">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Want to see a portfolio in action?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              View public portfolios using their slug URLs
            </p>
            <div style={{ maxWidth: '24rem', margin: '0 auto' }}>
              <div style={{ background: 'var(--background)', borderRadius: 'var(--radius)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontFamily: 'monospace' }}>porflyo.com/p/[slug]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
