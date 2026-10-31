import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "../../lib/gsap";

/* Logo coordinates traced from the supplied artwork.
   Coordinates are in artwork pixels (y points down). */
const SCALE = 0.0052;
const CENTER_X = 228;
const CENTER_Y = 150;
const LOGO_WIDTH = 460 * SCALE;

const toScene = ([x, y]) =>
  new THREE.Vector2(
    (x - CENTER_X) * SCALE,
    -(y - CENTER_Y) * SCALE
  );

// Z: top bar, diagonal, bottom bar
const Z_POINTS = [
  [84, 6],
  [318, 6],
  [130, 238],
  [274, 238],
  [232, 294],
  [-2, 294],
  [186, 62],
  [42, 62],
].map(toScene);

// K chevron
const K_POINTS = [
  [365, 5],
  [450, 5],
  [332, 148],
  [455, 292],
  [372, 292],
  [250, 148],
].map(toScene);

const MARK_COLOR = "#16171a";

const EXTRUDE = {
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.025,
  bevelSize: 0.02,
  bevelSegments: 4,
  curveSegments: 8,
};

function roundedShape(points, radius) {
  const shape = new THREE.Shape();
  const count = points.length;

  points.forEach((point, i) => {
    const prev = points[(i - 1 + count) % count];
    const next = points[(i + 1) % count];

    const toPrev = new THREE.Vector2().subVectors(prev, point);
    const toNext = new THREE.Vector2().subVectors(next, point);

    const rPrev = Math.min(radius, toPrev.length() / 2);
    const rNext = Math.min(radius, toNext.length() / 2);

    const start = point
      .clone()
      .addScaledVector(toPrev.normalize(), rPrev);

    const end = point
      .clone()
      .addScaledVector(toNext.normalize(), rNext);

    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);

    shape.quadraticCurveTo(point.x, point.y, end.x, end.y);
  });

  shape.closePath();
  return shape;
}

function buildGeometry(points, radius = 0.035) {
  const geometry = new THREE.ExtrudeGeometry(
    roundedShape(points, radius),
    EXTRUDE
  );

  geometry.translate(0, 0, -(EXTRUDE.depth / 2));
  return geometry;
}

function Mark({
  autoRotate,
  rotationSpeed,
  swing,
  fullSpin,
  hoverMultiplier,
  horizontalOffset,
  verticalOffset,
  journeyProgress,
}) {
  const group = useRef(null);
  const { viewport } = useThree();

  // GSAP animates this value between normal speed and hover speed.
  const speed = useRef({ value: rotationSpeed });
  const idleRotation = useRef(0);
  const journeyTurn = useRef(Math.PI * 2);

  const zGeometry = useMemo(() => buildGeometry(Z_POINTS), []);
  const kGeometry = useMemo(() => buildGeometry(K_POINTS), []);

  const fit = Math.min(1, (viewport.width * 0.88) / LOGO_WIDTH);
  const baseX = viewport.width * horizontalOffset;
  const baseY = viewport.height * verticalOffset;

  useEffect(() => {
    if (!group.current || journeyProgress) return;
    group.current.position.x = baseX;
    group.current.position.y = baseY;
  }, [baseX, baseY, journeyProgress]);

  const hoverIn = () => {
    if (!group.current) return;

    gsap.to(speed.current, {
      value: rotationSpeed * hoverMultiplier,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(group.current.position, {
      x: baseX + 0.08,
      y: baseY + 0.025,
      z: 0.06,
      duration: 1.05,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(group.current.rotation, {
      x: -0.12,
      z: -0.1,
      duration: 1.05,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const hoverOut = () => {
    if (!group.current) return;

    gsap.to(speed.current, {
      value: rotationSpeed,
      duration: 1.2,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(group.current.position, {
      x: baseX,
      y: baseY,
      z: 0,
      duration: 1.25,
      ease: "power2.inOut",
      overwrite: true,
    });

    gsap.to(group.current.rotation, {
      x: 0,
      z: 0,
      duration: 1.25,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  useFrame((state, delta) => {
    const target = group.current;
    if (!target) return;

    if (journeyProgress) {
      const progress = THREE.MathUtils.clamp(journeyProgress.current, 0, 1);
      if (autoRotate && progress < 0.001) {
        idleRotation.current += delta * speed.current.value;
        const remainder = idleRotation.current % (Math.PI * 2);
        journeyTurn.current = Math.PI * 2 + (Math.PI * 2 - remainder) % (Math.PI * 2);
      }
      target.position.x = THREE.MathUtils.lerp(baseX, 0, progress);
      target.position.y = THREE.MathUtils.lerp(baseY, 0, progress);
      target.position.z = 0;
      target.rotation.x = 0;
      target.rotation.y = idleRotation.current + progress * journeyTurn.current;
      target.rotation.z = 0;
      target.scale.setScalar(fit * THREE.MathUtils.lerp(1, 0.72, progress));
      return;
    }

    if (!autoRotate) return;

    const currentSpeed = speed.current.value;

    if (fullSpin) {
      target.rotation.y += delta * currentSpeed;
    } else {
      target.rotation.y =
        Math.sin(state.clock.elapsedTime * currentSpeed) * swing;
    }
  });

  return (
    <group
      ref={group}
      scale={fit}
      onPointerEnter={hoverIn}
      onPointerLeave={hoverOut}
    >
      <mesh geometry={zGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={MARK_COLOR}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      <mesh geometry={kGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={MARK_COLOR}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

export default function BlackZKModel({
  className,
  style,
  autoRotate = true,
  rotationSpeed = 0.12,
  swing = 0.18,
  fullSpin = true,
  hoverMultiplier = 3,
  horizontalOffset = 0.2,
  verticalOffset = 0,
  background = "transparent",
  scrollJourney = false,
}) {
  const root = useRef(null);
  const journeyProgress = useRef(0);

  useLayoutEffect(() => {
    if (!scrollJourney || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const manifesto = document.querySelector(".manifesto");
    if (!manifesto || !root.current) return undefined;

    const context = gsap.context(() => {
      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: manifesto,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      journey.to(journeyProgress, { current: 1, ease: "none" }, 0);

      ScrollTrigger.create({
        trigger: manifesto,
        start: "top bottom",
        onEnter: () => gsap.set(root.current, { autoAlpha: 0.14 }),
        onLeaveBack: () => gsap.set(root.current, { autoAlpha: 1 }),
      });

      ScrollTrigger.create({
        trigger: manifesto,
        start: "bottom 75%",
        onEnter: () => gsap.to(root.current, { autoAlpha: 0, duration: 0.25 }),
        onLeaveBack: () => gsap.to(root.current, { autoAlpha: 0.14, duration: 0.25 }),
      });
    }, root);

    return () => context.revert();
  }, [scrollJourney]);

  return (
    <div
      ref={root}
      className={className}
      aria-hidden="true"
      style={{
        width: "100%",
        height: 360,
        position: "relative",
        background,
        ...style,
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5.4], fov: 34 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[-3, 4, 5]} intensity={1.6} />
        <pointLight position={[3, -2, 2]} intensity={1} color="#c9ced6" />
        <pointLight position={[-3, -1, -2]} intensity={0.7} color="#e4e7ec" />

        {scrollJourney ? (
          <Mark
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
            swing={swing}
            fullSpin={fullSpin}
            hoverMultiplier={hoverMultiplier}
            horizontalOffset={horizontalOffset}
            verticalOffset={verticalOffset}
            journeyProgress={journeyProgress}
          />
        ) : (
          <Float
            speed={0.4}
            rotationIntensity={0.008}
            floatIntensity={0.025}
          >
            <Mark
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              swing={swing}
              fullSpin={fullSpin}
              hoverMultiplier={hoverMultiplier}
              horizontalOffset={horizontalOffset}
              verticalOffset={verticalOffset}
              journeyProgress={null}
            />
          </Float>
        )}

        <Environment preset="studio" environmentIntensity={0.55} />

      </Canvas>
    </div>
  );
}