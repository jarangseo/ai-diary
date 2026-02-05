/**
 * Get Tailwind color classes based on emotion score (-1 to 1).
 */
export function getEmotionColor(score: number | undefined): { bg: string; hover: string } {
  if (score === undefined) {
    return { bg: 'bg-gray-300', hover: 'hover:bg-gray-400' }
  }
  if (score <= -0.6) {
    return { bg: 'bg-indigo-400', hover: 'hover:bg-indigo-500' }
  }
  if (score <= -0.2) {
    return { bg: 'bg-blue-300', hover: 'hover:bg-blue-400' }
  }
  if (score <= 0.2) {
    return { bg: 'bg-gray-300', hover: 'hover:bg-gray-400' }
  }
  if (score <= 0.6) {
    return { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-400' }
  }
  return { bg: 'bg-orange-300', hover: 'hover:bg-orange-400' }
}

/**
 * Get hex color string for chart rendering based on emotion score (-1 to 1).
 */
export function getEmotionHex(score: number): string {
  if (score <= -0.6) return '#818CF8' // indigo-400
  if (score <= -0.2) return '#93C5FD' // blue-300
  if (score <= 0.2) return '#D1D5DB'  // gray-300
  if (score <= 0.6) return '#FDE047'  // yellow-300
  return '#FDBA74'                     // orange-300
}
