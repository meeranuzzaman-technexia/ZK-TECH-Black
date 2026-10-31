import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return undefined;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.65, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.65, ease: 'power3.out' });
    const syncCursorTone = () => {
      const rect = cursor.getBoundingClientRect();
      const element = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      const themedSurface = element?.closest('[data-cursor-theme]');
      cursor.classList.toggle('is-on-light', themedSurface?.dataset.cursorTheme === 'light');
    };
    const move = (event) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };
    const enter = () => cursor.classList.add('is-active');
    const leave = () => cursor.classList.remove('is-active');
    const targets = document.querySelectorAll(
      'a, button:not([data-cursor-native]), [data-cursor]',
    );

    window.addEventListener('pointermove', move, { passive: true });
    gsap.ticker.add(syncCursorTone);
    targets.forEach((target) => {
      target.addEventListener('pointerenter', enter);
      target.addEventListener('pointerleave', leave);
    });

    return () => {
      window.removeEventListener('pointermove', move);
      gsap.ticker.remove(syncCursorTone);
      targets.forEach((target) => {
        target.removeEventListener('pointerenter', enter);
        target.removeEventListener('pointerleave', leave);
      });
    };
  }, []);

  return (
    <div className="slow-cursor" ref={cursorRef} aria-hidden="true">
      <span />
    </div>
  );
}
