import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export function useDndSensors() {
  return useSensors(
    // Distance to start dragging
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
  );
}