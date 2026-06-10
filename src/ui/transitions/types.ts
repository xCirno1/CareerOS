/** Shared contract for full-screen page transitions. */
export interface TransitionProps {
  /** Flip true to play the transition once. */
  launching: boolean;
  /** Fires when the animation finishes (e.g. navigate here). */
  onDone: () => void;
}
