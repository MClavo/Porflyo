/**
 * useHeatmapSlots - Hook to manage heatmap slot selection state
 */

import { useState, useMemo } from 'react';
import { useMetricsStore } from '../state/metrics.store';
import type { SlotOption } from '../components/ui/SlotSelector';

// Helper function to format dates for display
const formatSlotDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format as "Day DD" (e.g., "Mon 28")
  const dayName = date.toLocaleDateString('en', { weekday: 'short' });
  const dayNumber = date.getDate();
  
  if (date.toDateString() === today.toDateString()) {
    return `Today ${dayNumber}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${dayNumber}`;
  } else {
    return `${dayName} ${dayNumber}`;
  }
};

export function useHeatmapSlots() {
  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const { slotByDate, slotIndex } = useMetricsStore();

  // Generate slot options for the dropdown
  const slotOptions = useMemo((): SlotOption[] => {
    if (!slotByDate || slotIndex.length === 0) {
      return [{ value: 'all', label: 'All Data' }];
    }

    const options: SlotOption[] = [
      { value: 'all', label: 'All Data' }
    ];

    // Add individual slot options
    slotIndex.forEach(date => {
      const slot = Object.values(slotByDate).find(s => s.date === date);
      if (slot && slot.heatmap && slot.heatmap.cells) {
        options.push({
          value: date,
          label: formatSlotDate(date),
          date: date
        });
      }
    });

    return options;
  }, [slotByDate, slotIndex]);

  const handleSlotChange = (slot: string) => {
    setSelectedSlot(slot);
  };

  return {
    selectedSlot,
    slotOptions,
    handleSlotChange
  };
}