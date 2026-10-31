import { useState } from 'react';
import { services } from '../../data/site';
import { WheelCarousel } from '../ui/WheelCarousel';
import Arrow from '../ui/Arrow';

const carouselItems = services.map((service) => ({
  label: service.title,
  image: service.image,
  imageAlt: service.title,
  originalData: service,
}));

export default function Services() {
  const [activeService, setActiveService] = useState(services[0]);

  return (
    <section
      className="services section-pad"
      id="services"
      aria-labelledby="services-title"
    >
      <div className="section-index services__index">
        <span>04</span>
        <span id="services-title">Services</span>
      </div>

      <div className="services__wheel-shell">
        <WheelCarousel
          items={carouselItems}
          photoSide="left"
          photoWidth={35}
          apexInset={14}
          radius={360}
          spacing={16}
          scrollDriven
          onActiveChange={(item) => setActiveService(item.originalData)}
        />

        <div className="services__detail" key={activeService?.index}>
          {/* <span>{activeService?.index}</span> */}
          <p>
            {activeService?.desc}
          </p>
          <a
            href={activeService?.href || '#'}
            aria-label={`Explore ${activeService?.title || 'service'}`}
          >
            Explore Service
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
