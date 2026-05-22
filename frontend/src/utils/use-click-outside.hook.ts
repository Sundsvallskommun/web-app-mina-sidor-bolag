import { RefObject, useEffect } from 'react';

export interface UseClickOutsideProps {
  ref: RefObject<HTMLElement | null>;
  onOutsideClick: () => void;
  enabled?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Calls `onOutsideClick` when the user interacts outside `ref`, either by
 * pointing/clicking elsewhere or pressing Escape (keyboard/WCAG-safe).
 * Listeners are bound on `window` and `pointerdown` covers both mouse and touch.
 */
export const useClickOutside = ({
  ref,
  onOutsideClick,
  enabled = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: UseClickOutsideProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        onOutsideClick();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOutsideClick();
      }
    };

    if (closeOnOutsideClick) {
      window.addEventListener('pointerdown', handlePointerDown);
    }
    if (closeOnEscape) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onOutsideClick, enabled, closeOnOutsideClick, closeOnEscape]);
};
