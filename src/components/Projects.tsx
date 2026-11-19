import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import SectionLabel from './ui/SectionLabel';

type Project = (typeof portfolio.projects)[number];

function ProjectMedia({ project, number }: { project: Project; number: string }) {
  const screenshot = existsSync(join(process.cwd(), 'public', project.media.slice(1)));

  return (
    <div className={`project-media ${project.visual}`}>
      <div className="media-viewport">
        <div className="media-visual">
          {screenshot ? (
            <Image src={project.media} alt={`${project.name} screenshot`} fill sizes="(max-width: 680px) 88vw, (max-width: 1600px) 46vw, 727px" />
          ) : (
            <div className="media-art" aria-hidden="true">
              {project.visual === 'catershub' ? (
                <>
                  <div className="cater-orbit" />
                  <span className="cater-word">Caters<span>Hub</span></span>
                  <span className="media-caption">CUISINE / BUDGET / REQUIREMENTS</span>
                </>
              ) : project.visual === 'iris' ? (
                <>
                  <div className="iris-ring" />
                  <span className="iris-mark">SPATIAL × TEMPORAL</span>
                </>
              ) : (
                <div className="deployment-diagram"><span>STAGING</span><i /><span>VERIFY</span><i /><span>DEPLOY</span></div>
              )}
            </div>
          )}
        </div>
      </div>
      <span className="media-top eyebrow" aria-hidden="true">{number} / {project.category}</span>
      {!screenshot && <span className="media-bottom eyebrow" aria-hidden="true">Engineering study</span>}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <SectionLabel dot>Selected work</SectionLabel>
      <h2 id="projects-title" className="section-title">FEATURED<br /><span className="chrome-text">ENGINEERING</span></h2>
      <div className="project-list">
        {portfolio.projects.map((project, i) => {
          const number = String(i + 1).padStart(2, '0');
          const titleId = `project-${number}-title`;
          return (
            <article className="project" key={project.name} aria-labelledby={titleId}>
              <ProjectMedia project={project} number={number} />
              <div className="project-copy">
                <span className="project-index eyebrow muted">{number} / {String(portfolio.projects.length).padStart(2, '0')}</span>
                <h3 id={titleId}>{project.name}</h3>
                <p className="project-subtitle editorial">{project.subtitle}</p>
                <p className="body-copy">{project.description}</p>
                <ul className="project-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
                {project.url && (
                  <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">
                    View live project<span className="sr-only"> for {project.name}</span> <ArrowUpRight size={18} aria-hidden="true" />
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
