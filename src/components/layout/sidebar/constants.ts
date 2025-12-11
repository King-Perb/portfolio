export const SIDEBAR_CONFIG = {
  WIDTH: 280, // px
  CONTENT_WIDTH: 250, // px
  Z_INDEX: 99999,
} as const;

export const ANIMATION_CONFIG = {
  DURATION: 500, // ms
  NAVIGATION_DELAY: 500, // ms - wait for animation to complete before navigating
  DOM_UPDATE_DELAY: 50, // ms
  INITIAL_MOUNT_DELAY: 100, // ms
  RIGHT_EDGE_OFFSET: 280, // px - matches sidebar width
} as const;

export const ANIMATION_PHASE = {
  IDLE: 'idle',
  MOVING_RIGHT: 'moving-right',
  MOVING_BACK: 'moving-back',
} as const;

export type AnimationPhase = typeof ANIMATION_PHASE[keyof typeof ANIMATION_PHASE];

