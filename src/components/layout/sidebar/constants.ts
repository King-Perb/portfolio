export const SIDEBAR_CONFIG = {
  WIDTH: 280, // px
  CONTENT_WIDTH: 250, // px
  Z_INDEX: 99999,
  MOBILE_Z_INDEX: 100, // z-index for mobile line element
  ANIMATION_OVERLAY_Z_INDEX: 10, // z-index for animation overlay above sidebar
} as const;

export const ANIMATION_CONFIG = {
  DURATION: 500, // ms
  DURATION_SECONDS: 0.5, // seconds (DURATION / 1000)
  NAVIGATION_DELAY: 500, // ms - wait for animation to complete before navigating
  DOM_UPDATE_DELAY: 50, // ms
  INITIAL_MOUNT_DELAY: 100, // ms
  RIGHT_EDGE_OFFSET: 280, // px - matches sidebar width
} as const;

export const LINE_CONFIG = {
  IDLE_WIDTH_MOBILE: 0.5, // px
  IDLE_WIDTH_DESKTOP: 1, // px
  ANIMATING_WIDTH_MOBILE: 1.5, // px
  ANIMATING_WIDTH_DESKTOP: 4, // px
  IDLE_OPACITY: 0.2, // 20% - matches bg-primary/20
  ANIMATING_OPACITY: 0.5, // 50% - more visible during animation
  KEYFRAME_TIME_THICK: 0.1, // 10% - when line becomes thick
  KEYFRAME_TIME_THIN: 0.8, // 80% - when line returns to thin
  KEYFRAME_TIME_END: 1, // 100% - end of animation
} as const;

export const ANIMATION_PHASE = {
  IDLE: 'idle',
  MOVING_RIGHT: 'moving-right',
  MOVING_BACK: 'moving-back',
} as const;

export type AnimationPhase = typeof ANIMATION_PHASE[keyof typeof ANIMATION_PHASE];
