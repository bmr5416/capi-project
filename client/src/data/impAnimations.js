/**
 * Clippy Animation Definitions
 * Extracted from modern-clippy (MIT License)
 * Source: https://github.com/vchaindz/modern-clippy/blob/main/src/sprites.ts
 */

// Frame dimensions from the original Clippy sprite sheet
export const FRAME_WIDTH = 124;
export const FRAME_HEIGHT = 93;
export const SPRITE_PATH = '/agents/Clippy/map.png';

/**
 * Animation definitions with frame coordinates
 * Each frame has: { x, y, duration }
 * - x, y: position in sprite sheet
 * - duration: milliseconds to display frame
 */
export const animations = {
  // Default idle state - single frame
  Idle: {
    frames: [
      { x: 0, y: 0, duration: 400 }
    ],
    useQueue: false
  },

  // Friendly greeting wave
  Wave: {
    frames: [
      { x: 1116, y: 1767, duration: 100 },
      { x: 1240, y: 1767, duration: 100 },
      { x: 1364, y: 1767, duration: 100 },
      { x: 1488, y: 1767, duration: 100 },
      { x: 1612, y: 1767, duration: 100 },
      { x: 1736, y: 1767, duration: 100 },
      { x: 1860, y: 1767, duration: 100 },
      { x: 1984, y: 1767, duration: 100 },
      { x: 2108, y: 1767, duration: 100 },
      { x: 2232, y: 1767, duration: 100 },
      { x: 2356, y: 1767, duration: 100 },
      { x: 2480, y: 1767, duration: 100 },
      { x: 2604, y: 1767, duration: 100 },
      { x: 2728, y: 1767, duration: 100 }
    ],
    useQueue: true
  },

  // Contemplation/processing
  Thinking: {
    frames: [
      { x: 124, y: 93, duration: 100 },
      { x: 248, y: 93, duration: 100 },
      { x: 372, y: 93, duration: 100 },
      { x: 496, y: 93, duration: 100 },
      { x: 620, y: 93, duration: 100 },
      { x: 744, y: 93, duration: 100 },
      { x: 868, y: 93, duration: 100 },
      { x: 992, y: 93, duration: 100 }
    ],
    useQueue: true
  },

  // Providing information
  Explain: {
    frames: [
      { x: 1116, y: 186, duration: 100 },
      { x: 1240, y: 186, duration: 100 },
      { x: 1364, y: 186, duration: 900 },
      { x: 1240, y: 186, duration: 100 },
      { x: 1116, y: 186, duration: 100 }
    ],
    useQueue: true
  },

  // Drawing attention
  GetAttention: {
    frames: [
      { x: 1240, y: 651, duration: 100 },
      { x: 1364, y: 651, duration: 100 },
      { x: 1488, y: 651, duration: 100 },
      { x: 1612, y: 651, duration: 100 },
      { x: 1736, y: 651, duration: 100 },
      { x: 1860, y: 651, duration: 100 },
      { x: 1984, y: 651, duration: 100 },
      { x: 2108, y: 651, duration: 100 }
    ],
    useQueue: true
  },

  // Celebration
  Congratulate: {
    frames: [
      { x: 0, y: 0, duration: 100 },
      { x: 124, y: 0, duration: 100 },
      { x: 248, y: 0, duration: 100 },
      { x: 372, y: 0, duration: 100 },
      { x: 496, y: 0, duration: 100 },
      { x: 620, y: 0, duration: 100 },
      { x: 744, y: 0, duration: 100 },
      { x: 868, y: 0, duration: 100 }
    ],
    useQueue: true
  },

  // Show animation (appearing)
  Show: {
    frames: [
      { x: 0, y: 0, duration: 100 },
      { x: 124, y: 0, duration: 100 },
      { x: 248, y: 0, duration: 100 },
      { x: 0, y: 0, duration: 200 }
    ],
    useQueue: true
  },

  // Hide animation (disappearing)
  Hide: {
    frames: [
      { x: 0, y: 0, duration: 100 },
      { x: 248, y: 0, duration: 100 },
      { x: 124, y: 0, duration: 100 },
      { x: 0, y: 0, duration: 100 }
    ],
    useQueue: true
  }
};

/**
 * Get animation by name with fallback to Idle
 */
export function getAnimation(name) {
  return animations[name] || animations.Idle;
}

/**
 * Get list of all available animation names
 */
export function getAnimationNames() {
  return Object.keys(animations);
}

/**
 * Calculate total duration of an animation
 */
export function getAnimationDuration(name) {
  const animation = getAnimation(name);
  return animation.frames.reduce((total, frame) => total + frame.duration, 0);
}
