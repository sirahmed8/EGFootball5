/**
 * Shared booking and time slot utilities
 */

export const formatTimeSlot = (slot: number): string => {
  const hour = Math.floor(slot);
  const minutes = slot % 1 === 0.5 ? '30' : '00';
  const period = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

export const calculateDurationHours = (startSlot: number, endSlot: number): number => {
  return endSlot - startSlot + 0.5;
};
