/**
 * Clamps a numerical value between a min and max bound.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (min > max) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamps (x, y) coordinates within the container boundaries so an overlay
 * element of (itemWidth, itemHeight) does not spill outside.
 *
 * @param {{ x: number, y: number }} position
 * @param {{ containerWidth: number, containerHeight: number, itemWidth: number, itemHeight: number }} bounds
 * @returns {{ x: number, y: number }}
 */
export function clampOverlayPosition(position, bounds) {
  const { x, y } = position;
  const { containerWidth, containerHeight, itemWidth, itemHeight } = bounds;

  const maxX = Math.max(0, containerWidth - itemWidth);
  const maxY = Math.max(0, containerHeight - itemHeight);

  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY),
  };
}

/**
 * Calculates initial centered coordinates for an overlay item inside a container.
 *
 * @param {{ containerWidth: number, containerHeight: number, itemWidth: number, itemHeight: number }} bounds
 * @returns {{ x: number, y: number }}
 */
export function getInitialCenteredPosition(bounds) {
  const { containerWidth, containerHeight, itemWidth, itemHeight } = bounds;
  return {
    x: Math.max(0, (containerWidth - itemWidth) / 2),
    y: Math.max(0, (containerHeight - itemHeight) / 2),
  };
}
