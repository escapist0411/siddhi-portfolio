import { ArrowDownRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
export default function Hero() {
  return <section id="home" className="hero" aria-labelledby="hero-title">
    <div className="hero-topline eyebrow"><span>{portfolio.name} / Engineering portfolio</span><span>2026</span></div>
    <div className="portrait-layer" data-future-canvas="portrait" aria-hidden="true"><div className="portrait-frame"><span className="portrait-cross">+</span><span className="portrait-caption">PORTRAIT STUDY / PENDING</span><span className="portrait-cross bottom">+</span></div></div>
    <h1 id="hero-title" className="hero-title chrome-text">PORTFOLIO</h1>
    <div className="hero-identity"><p className="hero-ai">AI &</p><p className="editorial">DevOps Engineer</p></div>
    <div className="hero-bottom"><p className="eyebrow">Intelligence in the model.<br />Intent in the deployment.</p><a className="scroll-link eyebrow" href="#about">Explore the portfolio <ArrowDownRight size={24} aria-hidden="true" /></a></div>
  </section>;
}
