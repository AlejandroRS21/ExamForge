// ExamForge — Pure Answer Logic Helpers
// Decoupled logic for answer state transformations & keyboard index calculations

export interface MatchOption {
  id: string;
  label: string;
}

export interface MatchItem {
  id: string;
  text: string;
}

export interface GapItem {
  id: string;
  text: string;
}

/**
 * Toggle or assign a match selection in MatchItems (MM)
 */
export function toggleMatch(
  currentMatches: Record<string, string>,
  itemId: string,
  optionId: string
): Record<string, string> {
  if (currentMatches[itemId] === optionId) {
    const updated = { ...currentMatches };
    delete updated[itemId];
    return updated;
  }
  return { ...currentMatches, [itemId]: optionId };
}

/**
 * Clear a specific item match in MatchItems (MM)
 */
export function clearMatch(
  currentMatches: Record<string, string>,
  itemId: string
): Record<string, string> {
  const updated = { ...currentMatches };
  delete updated[itemId];
  return updated;
}

/**
 * Place a new item in GapText (GT) placed sequence
 */
export function placeGapItem(placedIds: string[], itemId: string): string[] {
  if (placedIds.includes(itemId)) return placedIds;
  return [...placedIds, itemId];
}

/**
 * Remove an item from GapText (GT) placed sequence by index
 */
export function removeGapItem(placedIds: string[], index: number): string[] {
  if (index < 0 || index >= placedIds.length) return placedIds;
  const updated = [...placedIds];
  updated.splice(index, 1);
  return updated;
}

/**
 * Move an item up in GapText (GT) placed sequence
 */
export function moveGapItemUp(placedIds: string[], index: number): string[] {
  if (index <= 0 || index >= placedIds.length) return placedIds;
  const updated = [...placedIds];
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
  return updated;
}

/**
 * Move an item down in GapText (GT) placed sequence
 */
export function moveGapItemDown(placedIds: string[], index: number): string[] {
  if (index < 0 || index >= placedIds.length - 1) return placedIds;
  const updated = [...placedIds];
  [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
  return updated;
}

/**
 * Calculate next focused index for 1D/2D keyboard navigation
 */
export function calculateNextIndex(
  currentIndex: number,
  totalItems: number,
  key: string,
  columns: number = 1
): number {
  if (totalItems <= 0) return 0;
  
  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % totalItems;
    case "ArrowLeft":
      return (currentIndex - 1 + totalItems) % totalItems;
    case "ArrowDown":
      return Math.min(currentIndex + columns, totalItems - 1);
    case "ArrowUp":
      return Math.max(currentIndex - columns, 0);
    case "Home":
      return 0;
    case "End":
      return totalItems - 1;
    default:
      return currentIndex;
  }
}
