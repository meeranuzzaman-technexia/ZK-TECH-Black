import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function MagneticSpotlightMarquee({
  id,
  titleId,
  images,
  items,
  eyebrow = 'Our approach',
  title = 'The Process',
  footerText = 'Four phases. No shortcuts.',
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [copies, setCopies] = useState(3);

  const repeatedImages = useMemo(
    () => Array.from({ length: copies }, () => images).flat(),
    [copies, images],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const calculateCopies = () => {
      const imageSize = clamp(window.innerWidth * 0.14, 138, 184);
      const setWidth = images.length * (imageSize + 16);
      setCopies(Math.max(3, Math.ceil(section.clientWidth / setWidth) + 2));
    };

    calculateCopies();
    const resizeObserver = new ResizeObserver(calculateCopies);
    resizeObserver.observe(section);

    return () => resizeObserver.disconnect();
  }, [images]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const firstImage = track.querySelector('.magnetic-process__image');
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const oneSetWidth = ((firstImage?.getBoundingClientRect().width || 0) + gap) * images.length;
    const tween = gsap.fromTo(
      track,
      { x: 0 },
      {
        x: -oneSetWidth,
        duration: Math.max(12, oneSetWidth / 150),
        ease: 'none',
        repeat: -1,
      },
    );

    return () => tween.kill();
  }, [copies, images]);

  return (
    <section
      className="magnetic-process"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
    >
      <div className="magnetic-process__nav" aria-hidden="true">
        <span>03</span>
        <span>{eyebrow}</span>
      </div>

      <div className="magnetic-process__strip" aria-hidden="true">
        <div className="magnetic-process__track" ref={trackRef}>
          {repeatedImages.map((src, index) => (
            <img
              className="magnetic-process__image"
              src={src}
              alt=""
              loading={index < images.length ? 'eager' : 'lazy'}
              draggable="false"
              key={`${src}-${index}`}
            />
          ))}
        </div>
      </div>

      <div className="magnetic-process__content">
        <h2 className="magnetic-process__title" id={titleId}>
          {title}
        </h2>

        <ol className="magnetic-process__steps">
          {items.map((item) => (
            <li className="magnetic-process__step" key={item.step}>
              <div className="magnetic-process__step-top">
                <span>{item.step}</span>
                {/* <span>{item.meta}</span> */}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="magnetic-process__footer">{footerText}</p>
    </section>
  );
}
