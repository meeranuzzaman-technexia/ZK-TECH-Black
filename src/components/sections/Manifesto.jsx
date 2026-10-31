import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { manifesto, LIVE } from '../../data/site'
/* SECTION 2 — Distinctive Brand Identity & Timely Service Delivery
   Features word-by-word scroll reveal, smaller refined font, and animated check bullets. */
export default function Manifesto() {
  const root = useRef(null)
  const media = useRef(null)

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let refreshFrame

    const ctx = gsap.context(() => {
      const revealTargets = [
        '.manifesto__line',
        '.manifesto__bullet',
        '.manifesto__check',
        '.manifesto__trust',
      ]

      if (reducedMotion) {
        gsap.set(revealTargets, { opacity: 1, clearProps: 'transform' })
        return
      }

      /* Media: smooth scale-down clip reveal + parallax drift */
      if (media.current) {
        gsap.fromTo(
          media.current,
          { scale: 1.12, yPercent: 4 },
          {
            scale: 1,
            yPercent: 0,
            duration: 1.4,
            ease: 'zk-expo',
            scrollTrigger: { trigger: media.current, start: 'top 86%' },
          }
        )
        gsap.to('.manifesto__media img', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: media.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }

      /* Original dim-to-full word color reveal, without mutating React's DOM. */
      gsap.utils.toArray('.manifesto__line').forEach((line) => {
        const words = line.querySelectorAll('.word')
        gsap.fromTo(
          words,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: {
              trigger: line,
              start: 'top 84%',
              end: 'bottom 54%',
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          }
        )
      })

      /* Animated bullet points with checkmark pop */
      gsap.fromTo(
        '.manifesto__bullet',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'zk-expo',
          scrollTrigger: { trigger: '.manifesto__bullets', start: 'top 86%' },
        }
      )

      gsap.fromTo(
        '.manifesto__check',
        { scale: 0.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: '.manifesto__bullets', start: 'top 86%' },
        }
      )

      /* Trust strip fade */
      gsap.fromTo(
        '.manifesto__trust',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'zk-expo',
          scrollTrigger: { trigger: '.manifesto__trust', start: 'top 92%' },
        }
      )
    }, root)

    refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      ctx.revert()
    }
  }, [])

  return (
    <section className="section manifesto" id="manifesto" ref={root} aria-labelledby="manifesto-title" data-cursor-theme="light">
      <div className="shell">
        <header className="manifesto__header">
          <div className="section-index" data-reveal>
            <span>01</span>
            <span>Brand identity</span>
          </div>
          <h2
            className="display-title display-title--split"
            id="manifesto-title"
            data-reveal
          >
            <span>Shape it.</span>
            <em>Make it distinctive.</em>
          </h2>
        </header>

        {/* Section Grid: Left Media + Right Animated Content & Bullets */}
        <div className="manifesto__grid">
          <div className="manifesto__media" ref={media}>
            <img src={manifesto.media} alt="Create A Distinctive Brand Identity" loading="lazy" />
            {/* <div className="manifesto__badge">
              <i />
              Strategic Brand Partners
            </div> */}
          </div>

          <div className="manifesto__copy">
            {/* Animated word-by-word paragraph content (smaller font) */}
            <div className="manifesto__lines">
              {manifesto.lines.map((line, i) => (
                <p className="manifesto__line" key={i}>
                  {line.split(/\s+/).map((word, wordIndex, words) => (
                    <Fragment key={`${word}-${wordIndex}`}>
                      <span className="word">{word}</span>
                      {wordIndex < words.length - 1 && ' '}
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>

            {/* Animated Bullet Points */}
            <div className="manifesto__bullets">
              {manifesto.bullets.map((bullet, i) => (
                <div className="manifesto__bullet" key={i}>
                  <span className="manifesto__check" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="currentColor" />
                      <path
                        d="M6 10.5L8.8 13.2L14.2 7.5"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="manifesto__bullet-text">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Trusted by Organizations */}
            <div className="manifesto__trust">
              <p className="manifesto__trust-text">
                Trusted By The World&apos;s{' '}
                <a className="tlink" href={`${LIVE}/pages/about-us.php`} data-cursor="about">
                  Best Organizations
                </a>
              </p>
              <div className="manifesto__clients">
                <img src="/images/clients/c-1.webp" alt="Client organization" loading="lazy" />
                <img src="/images/clients/c-2.webp" alt="Client organization" loading="lazy" />
                <img src="/images/clients/c-3.webp" alt="Client organization" loading="lazy" />
                <img src="/images/clients/c-4.webp" alt="Client organization" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
