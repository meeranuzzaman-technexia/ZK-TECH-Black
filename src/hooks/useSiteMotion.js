import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function useSiteMotion(rootRef, loading, introReady) {
  // Falls back to `loading` if App.jsx doesn't pass introReady
  const heroReady = introReady ?? !loading;

  /* 1. HERO INTRO: starts as soon as the preloader begins dissolving */
  useLayoutEffect(() => {
    if (!heroReady || !rootRef.current) return undefined;

    const context = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set('.hero-line i, .hero .reveal-line, .hero__words span', {
          clearProps: 'all',
        });
        gsap.set('.hero-line i', { visibility: 'visible' });
        return;
      }

      gsap.fromTo(
        '.hero-line i',
        { xPercent: -22, clipPath: 'inset(0 100% 0 0)' },
        {
          xPercent: 0,
          clipPath: 'inset(0 0% 0 0)',
          visibility: 'visible',
          duration: 1.25,
          stagger: 0.14,
          ease: 'power4.out',
          onComplete: () => {
            gsap.set('.hero-line i', { clearProps: 'transform,clipPath' });
          },
        },
      );

      gsap.fromTo(
        '.hero .reveal-line, .hero__words span',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' },
      );
    }, rootRef);

    return () => context.revert();
  }, [heroReady, rootRef]);

  /* 2. SCROLL SETUP: runs after the preloader is gone, deferred two frames */
  useLayoutEffect(() => {
    if (loading || !rootRef.current) return undefined;

    const reducedMotion = prefersReducedMotion();
    let lenis;
    let context;
    let raf2;
    const tick = (time) => lenis?.raf(time * 1000);

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!rootRef.current) return;

        if (!reducedMotion) {
          lenis = new Lenis({
            duration: 1.65,
            smoothWheel: true,
            wheelMultiplier: 0.82,
            touchMultiplier: 1.15,
            anchors: { duration: 1.45 },
          });
          lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
        }

        context = gsap.context(() => {
          const proofScene = rootRef.current.querySelector('.container-scroll-animation');
          const contact = rootRef.current.querySelector('.smooth-scroll-stack > .contact');

          if (proofScene) {
            ScrollTrigger.create({
              trigger: proofScene,
              start: 'bottom bottom',
              end: () => `+=${Math.min(window.innerHeight, contact?.offsetHeight || window.innerHeight)}`,
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            });
          }

          if (reducedMotion) return;

          gsap.utils.toArray('[data-reveal]').forEach((element) => {
            gsap.fromTo(
              element,
              { opacity: 0, y: 52 },
              {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: element, start: 'top 88%', once: true },
              },
            );
          });

          gsap.utils.toArray('[data-parallax]').forEach((image) => {
            gsap.fromTo(
              image,
              { yPercent: -8, scale: 1.08 },
              {
                yPercent: 8,
                ease: 'none',
                scrollTrigger: {
                  trigger: image.parentElement,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                },
              },
            );
          });

          const rail = rootRef.current.querySelector('.work__rail');
          const viewport = rootRef.current.querySelector('.work__viewport');

          if (rail && viewport && window.innerWidth > 767) {
            const travel = () => Math.max(0, rail.scrollWidth - window.innerWidth + 48);
            gsap.to(rail, {
              x: () => -travel(),
              ease: 'none',
              scrollTrigger: {
                trigger: viewport,
                start: 'top top',
                end: () => `+=${travel()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }

          const work = rootRef.current.querySelector('.work');
          const workHeader = work?.querySelector('.work__header');
          const workList = work?.querySelector('.work__list');

          if (work && workHeader && workList) {
            const workReveal = gsap.timeline({
              scrollTrigger: {
                trigger: work,
                start: 'top bottom',
                end: 'top 30%',
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            });

            workReveal
              .fromTo(
                workHeader,
                { xPercent: -32, skewX: -7, opacity: 0.12 },
                { xPercent: -32, skewX: -7, opacity: 0.12, duration: 0.38, ease: 'none' },
              )
              .to(workHeader, {
                xPercent: 0,
                skewX: 0,
                opacity: 1,
                duration: 0.62,
                ease: 'power4.out',
              })
              .fromTo(
                workList,
                { xPercent: 34, clipPath: 'inset(0 0 0 100%)' },
                { xPercent: 34, clipPath: 'inset(0 0 0 100%)', duration: 0.5, ease: 'none' },
                0,
              )
              .to(workList, {
                xPercent: 0,
                clipPath: 'inset(0 0 0 0%)',
                duration: 0.5,
                ease: 'expo.out',
              });
          }

          const processSection = rootRef.current.querySelector('.magnetic-process');

          if (processSection) {
            gsap.timeline({
              scrollTrigger: {
                trigger: processSection,
                start: 'top bottom',
                end: 'top 48%',
                scrub: 0.35,
                invalidateOnRefresh: true,
              },
            })
              .fromTo(
                processSection,
                { clipPath: 'inset(50% 0)', scale: 0.96 },
                {
                  clipPath: 'inset(50% 0)',
                  scale: 0.96,
                  duration: 0.58,
                  ease: 'none',
                },
              )
              .to(processSection, {
                clipPath: 'inset(0% 0)',
                scale: 1,
                duration: 0.42,
                ease: 'expo.inOut',
              });
          }

          const services = rootRef.current.querySelector('.services');
          const servicesIndex = services?.querySelector('.services__index');
          const servicesWheel = services?.querySelector('.services__wheel-shell');

          if (services && servicesIndex && servicesWheel) {
            const servicesReveal = gsap.timeline({
              scrollTrigger: {
                trigger: services,
                start: 'top bottom',
                end: 'top 32%',
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });

            servicesReveal
              .fromTo(
                servicesIndex,
                { y: -90, opacity: 0 },
                { y: -90, opacity: 0, duration: 0.4, ease: 'none' },
              )
              .to(servicesIndex, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power4.out',
              })
              .fromTo(
                servicesWheel,
                {
                  yPercent: 46,
                  scale: 0.74,
                  rotateX: 18,
                  clipPath: 'inset(46% 8%)',
                  transformPerspective: 1200,
                },
                {
                  yPercent: 46,
                  scale: 0.74,
                  rotateX: 18,
                  clipPath: 'inset(46% 8%)',
                  duration: 0.52,
                  ease: 'none',
                },
                0,
              )
              .to(servicesWheel, {
                yPercent: 0,
                scale: 1,
                rotateX: 0,
                clipPath: 'inset(0% 0%)',
                duration: 0.48,
                ease: 'expo.out',
              });
          }

          gsap.utils.toArray('.process-card').forEach((card, index) => {
            if (index === 0) return;
            gsap.from(card, {
              yPercent: 14,
              scrollTrigger: {
                trigger: card,
                start: 'top 82%',
                end: 'top 44%',
                scrub: 1,
              },
            });
          });

          gsap.utils.toArray('[data-count]').forEach((counter) => {
            const target = Number(counter.dataset.count);
            const state = { value: 0 };
            gsap.to(state, {
              value: target,
              duration: 1.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: counter, start: 'top 90%', once: true },
              onUpdate: () => {
                counter.textContent = Math.round(state.value).toLocaleString();
              },
            });
          });
        }, rootRef);

        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      context?.revert();
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [loading, rootRef]);
}
