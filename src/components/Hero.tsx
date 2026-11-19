import { ArrowDownRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import ParticleFace from './ParticleFace';

export default function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-topline eyebrow" data-intro-detail>
        <span>{portfolio.name} / Engineering portfolio</span><span>2026</span>
      </div>
      <ParticleFace src="/siddhi.jpg" />
      <div className="hero-title-motion">
        <h1 id="hero-title" className="hero-title chrome-text" tabIndex={-1}>PORTFOLIO</h1>
      </div>
      <div className="hero-identity">
        <p className="hero-ai">AI &amp;</p>
        <p className="editorial">DevOps Engineer</p>
      </div>
      <div className="hero-bottom" data-intro-detail>
        <p className="eyebrow">Intelligence in the model.<br />Intent in the deployment.</p>
        <a className="scroll-link eyebrow" href="#about">
          Explore the portfolio <ArrowDownRight size={24} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
