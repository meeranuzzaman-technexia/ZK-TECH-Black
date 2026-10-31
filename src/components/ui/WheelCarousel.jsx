import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

/**
 * Wheel carousel: a photo on one side, a rotating text wheel on the other.
 * Drag, click an item, use arrow keys, or (once focused) scroll the mouse wheel.
 *
 * item: { label, image, imageAlt? }
 * Styling lives in the stylesheet under .wheel.
 */

const wrapIndex = (index, length) => ((index % length) + length) % length;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function shortestOffset(index, rotation, length) {
  let offset = index - rotation;
  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;
  return offset;
}

export function WheelCarousel({
  items,
  initialIndex = 0,
  photoSide = 'left',
  photoWidth = 34, // % of the stage
  radius = 320,
  spacing = 15, // degrees between items
  visibleItems = 6,
  apexInset = 30, // % from the left of the wheel column
  showMarker = true,
  scrollSpeed = 0.008,
  dragSpeed = 0.02,
  snap = true,
  momentum = true,
  scrollDriven = false,
  onActiveChange,
  className = '',
}) {
  const count = items.length;
  const instanceId = useId();
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const start = count ? wrapIndex(initialIndex, count) : 0;
  const [rotation, setRotation] = useState(start);
  const [selectedIndex, setSelectedIndex] = useState(start);
  const [isDragging, setIsDragging] = useState(false);
  const [listHeight, setListHeight] = useState(0);

  const stageRef = useRef(null);
  const listRef = useRef(null);
  const itemsRef = useRef(items);
  const onActiveRef = useRef(onActiveChange);
  const rotationRef = useRef(start);
  const selectedRef = useRef(start);
  const velocityRef = useRef(0);
  const targetRef = useRef(null);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ y: 0, rotation: start });
  const prevDragRef = useRef(start);
  const movedRef = useRef(0);
  const downIndexRef = useRef(null);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onActiveRef.current = onActiveChange;
  }, [onActiveChange]);

  const commitRotation = useCallback(
    (next) => {
      if (!count) return;
      rotationRef.current = next;
      setRotation(next);
      const index = wrapIndex(Math.round(next), count);
      if (index !== selectedRef.current) {
        selectedRef.current = index;
        setSelectedIndex(index);
        onActiveRef.current?.(itemsRef.current[index], index);
      }
    },
    [count],
  );

  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    lastFrameRef.current = performance.now();

    const tick = (now) => {
      const frameScale = clamp((now - lastFrameRef.current) / (1000 / 60), 0.25, 2);
      lastFrameRef.current = now;
      let keep = false;

      if (!draggingRef.current) {
        const target = targetRef.current;

        if (target !== null) {
          // eased move to an exact item (click / arrow keys)
          const delta = target - rotationRef.current;
          if (Math.abs(delta) > 0.002) {
            const ease = 1 - Math.pow(0.82, frameScale);
            commitRotation(rotationRef.current + delta * ease);
            keep = true;
          } else {
            commitRotation(target);
            targetRef.current = null;
          }
        } else if (Math.abs(velocityRef.current) > 0.0008) {
          // momentum after a drag / wheel flick
          commitRotation(rotationRef.current + velocityRef.current * frameScale);
          const friction = momentum && !reduceMotion ? (snap ? 0.9 : 0.94) : 0.8;
          velocityRef.current *= Math.pow(friction, frameScale);
          keep = true;
        } else if (snap) {
          velocityRef.current = 0;
          const snapTarget = Math.round(rotationRef.current);
          const delta = snapTarget - rotationRef.current;
          if (Math.abs(delta) > 0.001 && !reduceMotion) {
            const ease = 1 - Math.pow(0.76, frameScale);
            commitRotation(rotationRef.current + delta * ease);
            keep = true;
          } else {
            commitRotation(snapTarget);
          }
        } else {
          velocityRef.current = 0;
        }
      }

      frameRef.current = keep ? requestAnimationFrame(tick) : null;
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!scrollDriven || reduceMotion || !stage || count < 2) return undefined;

    const section = stage.closest('.services');
    if (!section) return undefined;

    let tween;

    const createScrollSequence = () => {
      if (tween) return;

      const driver = { rotation: start };
      tween = gsap.to(driver, {
        rotation: start + count - 1,
        ease: 'none',
        onUpdate: () => commitRotation(driver.rotation),
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round((count - 1) * window.innerHeight * 0.58)}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (count - 1),
            duration: { min: 0.18, max: 0.45 },
            delay: 0.04,
            ease: 'power1.inOut',
          },
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const destroyScrollSequence = () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = undefined;
    };

    createScrollSequence();

    return () => {
      destroyScrollSequence();
    };
  }, [commitRotation, count, reduceMotion, scrollDriven, start]);

  // Track the wheel height so the radius never exceeds what fits
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setListHeight(entry.contentRect.height));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Mouse wheel only rotates the carousel while it has focus (click it first),
  // so it never traps normal page scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const onWheel = (event) => {
      if (scrollDriven) return;
      if (event.ctrlKey || event.metaKey) return;
      if (document.activeElement !== stage) return;
      event.preventDefault();
      targetRef.current = null;
      const delta = event.deltaY * scrollSpeed;
      commitRotation(rotationRef.current + delta);
      velocityRef.current = clamp(delta * 0.2, -0.35, 0.35);
      runAnimation();
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [commitRotation, runAnimation, scrollDriven, scrollSpeed]);

  const moveTo = (target) => {
    velocityRef.current = 0;
    if (reduceMotion) {
      commitRotation(target);
      return;
    }
    targetRef.current = target;
    runAnimation();
  };

  const moveBy = (amount) =>
    moveTo((targetRef.current ?? Math.round(rotationRef.current)) + amount);

  const goTo = (index) => {
    const base = Math.round(rotationRef.current);
    moveTo(base + shortestOffset(index, base, count));
  };

  const handlePointerDown = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    targetRef.current = null;
    movedRef.current = 0;
    const hit = event.target.closest?.('[data-index]');
    downIndexRef.current = hit ? Number(hit.dataset.index) : null;
    dragOriginRef.current = { y: event.clientY, rotation: rotationRef.current };
    prevDragRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    const distance = event.clientY - dragOriginRef.current.y;
    movedRef.current = Math.max(movedRef.current, Math.abs(distance));
    const next = dragOriginRef.current.rotation - distance * dragSpeed;
    velocityRef.current = clamp(next - prevDragRef.current, -0.6, 0.6);
    prevDragRef.current = next;
    commitRotation(next);
  };

  const handlePointerEnd = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // a tap on an item (not a drag) selects it
    if (event.type === 'pointerup' && movedRef.current < 6 && downIndexRef.current !== null) {
      goTo(downIndexRef.current);
    } else {
      runAnimation();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(count - 1);
    }
  };

  if (!count) return null;

  const selected = wrapIndex(selectedIndex, count);
  const effectiveRadius = listHeight ? Math.min(radius, listHeight * 0.62) : radius;

  return (
    <div
      className={`wheel ${photoSide === 'right' ? 'wheel--photo-right' : ''} ${className}`.trim()}
      style={{ '--wheel-photo': `${photoWidth}%`, '--wheel-apex': `${apexInset}%` }}
    >
      <div
        ref={stageRef}
        className={`wheel__stage ${isDragging ? 'is-dragging' : ''}`.trim()}
        role="listbox"
        aria-label="Services"
        aria-activedescendant={`${instanceId}-item-${selected}`}
        tabIndex={0}
        data-lenis-prevent={scrollDriven ? undefined : ''}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="wheel__photo-col">
          <div className="wheel__photo">
            {items.map((item, index) => (
              <img
                className={index === selected ? 'is-active' : ''}
                src={item.image}
                alt={index === selected ? (item.imageAlt ?? item.label) : ''}
                loading={index === start ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                key={`${item.label}-${index}`}
              />
            ))}
          </div>
        </div>

        <div className="wheel__list" ref={listRef}>
          {showMarker && <span className="wheel__marker" aria-hidden="true" />}

          {items.map((item, index) => {
            const offset = shortestOffset(index, rotation, count);
            if (Math.abs(offset) > visibleItems + 1) return null;

            const angle = offset * spacing;
            const radians = (angle * Math.PI) / 180;
            const x = -effectiveRadius * (1 - Math.cos(radians));
            const y = effectiveRadius * Math.sin(radians);
            const distance = Math.min(Math.abs(offset) / visibleItems, 1);
            const opacity = Math.cos((distance * Math.PI) / 2);
            const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45);
            
            const isSelected = Math.abs(offset) < 0.5;

            return (
              <div
                id={`${instanceId}-item-${index}`}
                className={`wheel__item ${isSelected ? 'is-selected' : ''}`.trim()}
                data-index={index}
                role="option"
                aria-selected={index === selected}
                style={{
                  opacity,
                  transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg) scale(${scale})`,
                }}
                key={`${item.label}-${index}`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      <span className="wheel__sr" aria-live="polite">
        {items[selected].label}, item {selected + 1} of {count}
      </span>
    </div>
  );
}
