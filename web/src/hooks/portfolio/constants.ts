import type { DropAnimation } from '@dnd-kit/core';
import { defaultDropAnimationSideEffects as _defaultDropAnimationSideEffects } from '@dnd-kit/core';

export const dropAnimation: DropAnimation = {
  sideEffects: _defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.5' } },
  }),
};