import { navLinks, projects } from '../../data/site';
import HoverExpand from '../ui/HoverExpand';

export default function Work() {
  const items = projects.map((project, index) => ({
    label: project.name,
    sublabel: `${project.category} · ${project.year}`,
    image: project.image,
    imageAlt: `${project.name} project`,
    description: project.description,
    href: project.href,
    index: project.index ?? String(index + 1).padStart(2, '0'),
  }));

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <header className="work__header section-pad">
        <div className="section-index" data-reveal>
          <span>02</span>
          <span>Projects in focus</span>
        </div>
        <h2 className="display-title display-title--split" id="work-title" data-reveal>
          <span>See it.</span>
          <em>Feel the difference.</em>
        </h2>
        {/* <div className="work__intro" data-reveal>
          <p>{featured.blurb}</p>
          <Arrow direction="down" />
        </div> */}
      </header>

      <div className="work__list section-pad">
        <HoverExpand items={items} />
      </div>

      {/* <footer className="work__footer section-pad">
        <p>Selected work · {String(projects.length).padStart(2, '0')} projects</p>
        <a href={navLinks[3].href}>All projects <sup>({projects.length})</sup></a>
      </footer> */}
    </section>
  );
}
