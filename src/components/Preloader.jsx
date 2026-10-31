import { useEffect, useRef, useState } from 'react';
import '../styles/Preloader.css';

// Traced from the supplied logo. Its first point is the bottom-left corner.
const Z_OUTLINE = `
  M 100.2 398.2
  C 96.2 398.2 94.0 395.7 96.9 391.8
  L 247.0 214.3
  L 127.7 214.3
  L 151.8 177.6
  C 157.0 169.4 162.8 165.0 172.0 165.0
  L 348.8 165.0
  C 352.9 165.0 354.7 167.8 351.3 171.8
  L 197.1 351.2
  L 305.3 351.2
  L 348.0 398.2
  Z
`;

const K_OUTLINE = `
  M 400.1 398.2
  L 298.3 285.4
  Q 291.6 277.4 298.4 269.5
  L 386.4 165.0
  L 455.9 165.0
  Q 459.7 165.0 456.8 168.5
  L 362.6 272.7
  Q 359.9 275.4 362.5 278.3
  L 469.5 398.2
  Z
`;

/**
 * Draws the logo once, holds the completed outline, then dissolves away.
 * onDissolveStart runs the moment the dissolve begins (start the hero intro here).
 * onComplete runs AFTER the dissolve finishes.
 * Set loop to true only when an indefinitely repeating preview is needed.
 */
export default function LogoPreloader({
  duration = 1800,
  dissolveDuration = 500,
  loop = false,
  onDissolveStart,
  onComplete,
}) {
  const [phase, setPhase] = useState('drawing');
  const onCompleteRef = useRef(onComplete);
  const onDissolveStartRef = useRef(onDissolveStart);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onDissolveStartRef.current = onDissolveStart;
  }, [onComplete, onDissolveStart]);

  const safeDuration = Number.isFinite(duration) ? Math.max(1000, duration) : 1800;
  const safeDissolve = Number.isFinite(dissolveDuration)
    ? Math.max(1, dissolveDuration)
    : 500;

  useEffect(() => {
    if (loop) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setTimeout(
      () => {
        setPhase('dissolving');
        onDissolveStartRef.current?.();
      },
      reducedMotion.matches ? 0 : safeDuration,
    );

    return () => window.clearTimeout(timer);
  }, [loop, safeDuration]);

  // Some automated browsers do not reliably dispatch CSS animationend.
  // Keep the visual event path, with a timed fallback so the overlay can never stick.
  useEffect(() => {
    if (phase !== 'dissolving' || loop) return undefined;

    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase('complete');
      onCompleteRef.current?.();
    }, safeDissolve + 100);

    return () => window.clearTimeout(timer);
  }, [loop, phase, safeDissolve]);

  function finishDissolve(event) {
    // Ignore animationend events bubbling up from the two SVG paths.
    if (
      event.target !== event.currentTarget ||
      event.animationName !== 'dissolve-preloader' ||
      completedRef.current
    ) {
      return;
    }

    completedRef.current = true;
    setPhase('complete');
    onCompleteRef.current?.();
  }

  if (phase === 'complete') return null;

  const className = [
    'logo-preloader',
    loop && 'logo-preloader--loop',
    phase === 'dissolving' && 'logo-preloader--dissolving',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={{
        '--cycle-duration': `${safeDuration}ms`,
        '--dissolve-duration': `${safeDissolve}ms`,
        '--iterations': loop ? 'infinite' : '1',
      }}
      onAnimationEnd={finishDissolve}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        className="logo-preloader__logo"
        viewBox="86 155 393 253"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g className="logo-preloader__outline">
          <path
            className="logo-preloader__path logo-preloader__path--z"
            d={Z_OUTLINE}
            pathLength="1"
          />
          <path
            className="logo-preloader__path logo-preloader__path--k"
            d={K_OUTLINE}
            pathLength="1"
          />
        </g>
      </svg>
    </div>
  );
}