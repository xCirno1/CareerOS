import type { ComponentType } from 'react';

/** Shared contract for full-screen page transitions. */
export interface TransitionProps {
  /** Flip true to play the transition once. */
  launching: boolean;
  /** Fires when the animation finishes (e.g. navigate here). */
  onDone: () => void;
}

export type TransitionId =
  | 'rocket'
  | 'portal'
  | 'liquid'
  | 'constellation'
  | 'paper-plane'
  | 'ripple'
  | 'cloud-bloom'
  | 'elevator'
  | 'compass';

export type TransitionComponent = ComponentType<TransitionProps>;

export interface TransitionEntry {
  id: TransitionId;
  name: string;
  blurb: string;
  emoji: string;
  Component: TransitionComponent;
}
