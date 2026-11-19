import { portfolio } from '@/data/portfolio';
import SectionLabel from './ui/SectionLabel';
export default function About() {
  return <section id="about" className="section about" aria-labelledby="about-title"><SectionLabel>About me</SectionLabel>
    <div className="about-grid"><div><h2 id="about-title" className="chrome-text display-title">INTRO</h2><p className="editorial about-aside">Curiosity.<br />Code. Possibility.</p></div>
    <div className="glass biography"><p className="bio-lead">From an idea to<br /><span className="editorial">something that runs.</span></p><p className="body-copy">{portfolio.biography}</p><div className="bio-detail"><span className="eyebrow">Education</span><p>{portfolio.education.degree}</p><p className="muted">{portfolio.education.institution}<br />{portfolio.education.dates}</p></div>{portfolio.experience.map(item => <div className="bio-detail" key={item.company}><span className="eyebrow">{item.dates}</span><p>{item.role}</p><p className="muted">{item.company}</p></div>)}</div></div>
    <div className="stack"><h3 className="eyebrow">The stack <span className="muted">/ Technologies & learning</span></h3>{portfolio.stack.map((row, i) => <div className="stack-row" data-marquee-row={i} key={i}><div className="stack-track">{row.map(tech => <span key={tech}>{tech}<b aria-hidden="true">✳</b></span>)}</div></div>)}</div>
  </section>;
}
