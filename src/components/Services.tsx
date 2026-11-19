import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import SectionLabel from './ui/SectionLabel';
export default function Services() {
  return <section id="services" className="section services" aria-labelledby="services-title"><SectionLabel>Services / Expertise</SectionLabel><h2 id="services-title" className="section-title align-right">WHAT I<br /><span className="chrome-text">CAN DO</span></h2><ol className="service-list">{portfolio.services.map((service, i) => <li className="service-row" key={service}><span className="eyebrow service-number">0{i + 1}</span><h3>{service}</h3><ArrowUpRight aria-hidden="true" /></li>)}</ol></section>;
}
