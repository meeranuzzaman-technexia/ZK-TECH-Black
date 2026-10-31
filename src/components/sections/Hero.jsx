import TwistingRibbon from '../ui/TwistingRibbon'
import { heroIntro, heroTicker } from '../../data/site'

const ribbonColors = Object.freeze({
  face: '#3356A6',
  foldA: '#FFFFFF',
  foldB: '#8E8B83',
  foldC: '#131412',
})

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__ribbon-bg" aria-hidden="true">
        <TwistingRibbon
          waveSpeed={0.012}
          waveAmplitude={0.9}
          lightColors={ribbonColors}
          darkColors={ribbonColors}
        />
      </div>

      {/* <div className="hero__eyebrow reveal-line">
        <span>Independent digital studio</span>
        <span>Richmond, Texas</span>
      </div> */}

      <h1 className="hero__title" id="hero-title">
        <span className="hero-line"><i>Think</i></span>
        <span className="hero-line"><i>Build</i></span>
        <span className="hero-line hero-line--offset"><i>Automate</i></span>
      </h1>

      <aside className="hero__service-index reveal-line" aria-label="Our capabilities">
        {/* <p>{heroIntro}</p> */}
        <ol>
          {heroTicker.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
      </aside>

      {/* <div className="hero__bottom reveal-line">
        <p>{heroIntro}</p>
        <a className="circle-link" href="#work" aria-label="Explore selected work">
          <Arrow direction="down" />
        </a>
      </div> */}

      {/* <div className="hero__words" aria-hidden="true">
        {heroWords.map((word) => (
          <span className={word.pos} key={word.label}>{word.label}</span>
        ))}
      </div> */}
    </section>
  );
}
