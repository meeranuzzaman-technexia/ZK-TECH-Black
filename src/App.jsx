import { useEffect, useRef, useState } from 'react';
import LogoPreloader from './components/Preloader';
import { Footer, Header } from './components/layout';
import {
  Contact,
  Hero,
  Manifesto,
  Process,
  Proof,
  Services,
  Work,
} from './components/sections';
import Cursor from './components/ui/Cursor';
import BlackZKModel from './components/ui/BlackZKModel';
import { ContainerScroll } from './components/ui/container-scroll-animation';
import SmoothScroll from './components/ui/smooth-scroll';
import useSiteMotion from './hooks/useSiteMotion';
import './App.css';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);

  useSiteMotion(rootRef, loading);

  useEffect(() => {
    document.body.classList.toggle('is-loading', loading);
    document.body.classList.toggle('menu-open', menuOpen);

    return () => document.body.classList.remove('is-loading', 'menu-open');
  }, [loading, menuOpen]);

  return (
    <>
      <div className="site" ref={rootRef} aria-busy={loading}>
        <Cursor />
        <BlackZKModel
          className="zk-model-journey"
          style={{ height: '86svh', top: '7svh', position: 'fixed' }}
          horizontalOffset={0.12}
          verticalOffset={0.1}
          scrollJourney
        />
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((value) => !value)}
          onCloseMenu={() => setMenuOpen(false)}
        />

        <main>
          <Hero />
          <Manifesto />
          <SmoothScroll>
          <Work />
          <Process />
          <Services />
            <ContainerScroll titleComponent={null}>
              <Proof />
            </ContainerScroll>
            <Contact />
          </SmoothScroll>
        </main>

        <Footer />
      </div>

      {loading && (
        <LogoPreloader
          duration={1800}
          dissolveDuration={500}
          onComplete={() => setLoading(false)}
        />
      )}
    </>
  );
}
