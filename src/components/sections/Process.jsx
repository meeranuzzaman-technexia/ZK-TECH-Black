import { process, projects } from '../../data/site';
import MagneticSpotlightMarquee from '../ui/MagneticSpotlightMarquee';

const processImages = projects.map((project) => project.image);

export default function Process() {
  return (
    <MagneticSpotlightMarquee
      id="process"
      titleId="process-title"
      images={processImages}
      items={process}
    />
  );
}
