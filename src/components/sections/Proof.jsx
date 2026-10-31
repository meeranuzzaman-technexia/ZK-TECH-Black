import { useEffect, useRef, useState } from 'react';
import { awards, stats, testimonials } from '../../data/site';

const marqueeAwards = Array.from({ length: 5 }, () => awards).flat();

export default function Proof() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [testimonialTransition, setTestimonialTransition] = useState(true);
  const resetFrameRef = useRef(null);
  const testimonialCount = testimonials.length;

  useEffect(() => {
    if (testimonialPaused) return undefined;

    const timer = window.setTimeout(() => {
      setTestimonialTransition(true);
      setTestimonialIndex((current) => Math.min(current + 1, testimonialCount));
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [testimonialCount, testimonialIndex, testimonialPaused]);

  useEffect(
    () => () => {
      if (resetFrameRef.current !== null) cancelAnimationFrame(resetFrameRef.current);
    },
    [],
  );

  const handleTestimonialTransitionEnd = () => {
    if (testimonialIndex !== testimonialCount) return;
    setTestimonialTransition(false);
    setTestimonialIndex(0);
    resetFrameRef.current = requestAnimationFrame(() => {
      resetFrameRef.current = requestAnimationFrame(() => {
        setTestimonialTransition(true);
        resetFrameRef.current = null;
      });
    });
  };

  const showNextTestimonial = () => {
    setTestimonialTransition(true);
    setTestimonialIndex((current) => Math.min(current + 1, testimonialCount));
  };

  const showPreviousTestimonial = () => {
    if (testimonialIndex > 0) {
      setTestimonialTransition(true);
      setTestimonialIndex((current) => current - 1);
      return;
    }

    setTestimonialTransition(false);
    setTestimonialIndex(testimonialCount);
    resetFrameRef.current = requestAnimationFrame(() => {
      resetFrameRef.current = requestAnimationFrame(() => {
        setTestimonialTransition(true);
        setTestimonialIndex(testimonialCount - 1);
        resetFrameRef.current = null;
      });
    });
  };

  return (
    <section className="proof" aria-labelledby="proof-title" data-cursor-theme="light">
      <div className="awards-marquee" aria-hidden="true">
        <div className="awards-marquee__track">
          {[0, 1].map((copy) => (
            <div className="awards-marquee__group" key={copy}>
              {marqueeAwards.map((award, index) => (
                <span key={`${copy}-${award}-${index}`}>{award}<i>·</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="section-pad">
        <div className="section-index" data-reveal>
          <span>05</span>
          <span id="proof-title">Built on proof</span>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat" key={stat.label} data-reveal>
              <strong><span data-count={stat.value}>0</span>{stat.suffix}</strong>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>

        <div
          className="testimonials"
          aria-label="Client testimonials"
          data-reveal
          onMouseEnter={() => setTestimonialPaused(true)}
          onMouseLeave={() => setTestimonialPaused(false)}
          onFocus={() => setTestimonialPaused(true)}
          onBlur={() => setTestimonialPaused(false)}
        >
          <div
            className={`testimonials__track ${testimonialTransition ? 'is-animated' : ''}`.trim()}
            style={{
              transform: `translate3d(-${testimonialIndex * (100 / (testimonialCount * 2))}%, 0, 0)`,
            }}
            onTransitionEnd={handleTestimonialTransitionEnd}
          >
            {[0, 1].map((copy) => (
              <div
                className="testimonials__group"
                aria-hidden={copy === 1 ? 'true' : undefined}
                key={copy}
              >
                {testimonials.map((item, index) => (
                  <blockquote key={`${copy}-${item.company}`} data-cursor-theme="dark">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>“{item.quote}”</p>
                    <footer>{item.name}<i>{item.company}</i></footer>
                  </blockquote>
                ))}
              </div>
            ))}
          </div>

          <div className="testimonials__controls">
            <button
              type="button"
              data-cursor-native
              onClick={showPreviousTestimonial}
              aria-label="Previous testimonial"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              type="button"
              data-cursor-native
              onClick={showNextTestimonial}
              aria-label="Next testimonial"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <span className="testimonials__status" aria-live="polite">
            Testimonial {(testimonialIndex % testimonialCount) + 1} of {testimonialCount}
          </span>
        </div>
      </div>
    </section>
  );
}
