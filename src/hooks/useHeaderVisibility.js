import { useEffect, useState } from 'react';

const TOP_ZONE = 10; // px from the top where the header is always shown, no glass
const HIDE_AFTER = 80; // px from the top before the header is allowed to hide
const TRIGGER = 8; // px of scrolling in one direction that flips the header

/**
 * Reverse-sticky header:
 *  - scroll down a little  -> hidden
 *  - scroll up a little    -> visible again (with the glass background)
 *
 * Returns { hidden, scrolled }.
 * `scrolled` is true as soon as the page has left the top zone (used for the glass look).
 */
export default function useHeaderVisibility() {
  const [state, setState] = useState({ hidden: false, scrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let travelled = 0; // signed distance scrolled since the direction last changed
    let frame = null;

    const commit = (hidden, scrolled) =>
      setState((prev) =>
        prev.hidden === hidden && prev.scrolled === scrolled ? prev : { hidden, scrolled },
      );

    const update = () => {
      frame = null;
      const y = Math.max(window.scrollY, 0);
      const dy = y - lastY;
      lastY = y;

      if (y <= TOP_ZONE) {
        travelled = 0;
        commit(false, false);
        return;
      }

      // direction flipped: start counting again
      if ((dy > 0 && travelled < 0) || (dy < 0 && travelled > 0)) travelled = 0;
      travelled += dy;

      setState((prev) => {
        let { hidden } = prev;
        if (travelled > TRIGGER && y > HIDE_AFTER) hidden = true;
        else if (travelled < -TRIGGER) hidden = false;

        return prev.hidden === hidden && prev.scrolled ? prev : { hidden, scrolled: true };
      });
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update(); // correct state if the page loads already scrolled
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return state;
}