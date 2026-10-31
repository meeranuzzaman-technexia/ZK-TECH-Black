import { useEffect, useRef, useState } from 'react';
import { contact, navLinks } from '../../data/site';
import useHeaderVisibility from '../../hooks/useHeaderVisibility';
import Arrow from '../ui/Arrow';

const sectionLinks = [
  { label: navLinks[0].label, href: '#top', index: '01' },
  { label: navLinks[3].label, href: '#work', index: '02' },
  { label: navLinks[2].label, href: '#services', index: '03' },
  { label: navLinks[1].label, href: '#studio', index: '04' },
  { label: navLinks[6].label, href: '#contact', index: '05' },
];

export default function Header({ menuOpen, onToggleMenu, onCloseMenu }) {
  // hidden: scrolling down -> header slides away, scrolling up -> it returns
  // scrolled: page has left the top, so the glass background is used
  const { hidden, scrolled } = useHeaderVisibility();
  const headerRef = useRef(null);
  const [isOnLight, setIsOnLight] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    let frameId;
    const syncLogoTheme = () => {
      frameId = undefined;
      const sampleY = Math.min(header.getBoundingClientRect().height / 2, 32);
      const themedSurface = document
        .elementsFromPoint(window.innerWidth / 2, sampleY)
        .map((element) => element.closest?.('[data-cursor-theme]'))
        .find(Boolean);

      setIsOnLight(themedSurface?.dataset.cursorTheme === 'light');
    };

    const requestSync = () => {
      if (frameId === undefined) frameId = requestAnimationFrame(syncLogoTheme);
    };

    requestSync();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);

    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
    };
  }, []);

  // Escape closes the overlay
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, onCloseMenu]);

  const headerClass = [
    'site-header',
    hidden && !menuOpen && 'is-hidden',
    scrolled && !menuOpen && 'is-glass',
    menuOpen && 'is-menu-open',
    isOnLight && 'is-on-light',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header ref={headerRef} className={headerClass}>
        <a className="brand" href="#top" aria-label="ZK Tech Solutions home">
          {/* Both marks stay loaded so section-based switching never flashes. */}
          <img className="brand__logo brand__logo--light" src="/images/zk-mark.png" alt="" />
          <img className="brand__logo brand__logo--dark" src="/images/zk-mark-black.png" alt="" />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {sectionLinks.slice(1).map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>

        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={onToggleMenu}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          {/* dot when closed, cross when open (see .menu-toggle i in the CSS) */}
          <i className="menu-toggle__icon" aria-hidden="true" />
        </button>
      </header>

      {/* data-lenis-prevent lets this overlay scroll natively on small screens */}
      <div
        className={`site-menu ${menuOpen ? 'is-open' : ''}`}
        id="site-menu"
        aria-hidden={!menuOpen}
        data-lenis-prevent
      >
        <nav aria-label="Menu navigation">
          {sectionLinks.map((link) => (
            <a href={link.href} key={link.href} onClick={onCloseMenu}>
              <span>{link.index}</span>
              {link.label}
              <Arrow />
            </a>
          ))}
        </nav>

        <div className="site-menu__foot">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p>{contact.address}</p>
        </div>
      </div>
    </>
  );
}