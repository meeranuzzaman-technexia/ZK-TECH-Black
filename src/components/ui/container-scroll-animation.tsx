'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

type ContainerScrollProps = {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
};

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const updateMobile = () => setIsMobile(media.matches);

    updateMobile();
    media.addEventListener('change', updateMobile);
    return () => media.removeEventListener('change', updateMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [20, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : isMobile ? [0.7, 0.9] : [1.05, 1],
  );
  const translate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -100]);

  return (
    <div
      className="container-scroll-animation relative flex items-center justify-center"
      ref={containerRef}
    >
      <div className="relative w-full [perspective:1000px]">
        {titleComponent ? <Header translate={translate}>{titleComponent}</Header> : null}
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

type HeaderProps = {
  translate: MotionValue<number>;
  children: React.ReactNode;
};

export function Header({ translate, children }: HeaderProps) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {children}
    </motion.div>
  );
}

type CardProps = {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
};

export function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        transformOrigin: 'top center',
      }}
      className="container-scroll-animation__card w-full"
    >
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
}
