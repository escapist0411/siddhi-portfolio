'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { PORTRAIT_REFORM } from '@/lib/animations';

export default function Contact() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const reset = useRef<number | undefined>(undefined);
  const copyRequest = useRef(0);
  const { email } = portfolio;

  useEffect(() => () => {
    window.clearTimeout(reset.current);
    copyRequest.current++;
  }, []);

  async function copyEmail() {
    const request = ++copyRequest.current;
    window.clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(email);
      if (request !== copyRequest.current) return;
      setCopyState('copied');
      reset.current = window.setTimeout(() => setCopyState('idle'), 2200);
    } catch {
      if (request === copyRequest.current) setCopyState('error');
    }
  }

  const copied = copyState === 'copied';
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <span className="pill availability eyebrow">
        <span className="status-dot" aria-hidden="true" />Available for software, AI &amp; DevOps opportunities
      </span>
      <div className="contact-grid">
        <div>
          <h2 id="contact-title" className="contact-title">LET’S BUILD<br /><span className="editorial">INTELLIGENT</span><br />SYSTEMS.</h2>
          <p className="body-copy contact-copy">{portfolio.contactCopy}</p>
          <div className="contact-actions">
            <a className="primary-button" data-magnetic href={`mailto:${email}`}>
              Send an email <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <button type="button" className="copy-button" onClick={copyEmail}>
              {copied ? 'Copied' : 'Copy email'}
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
          </div>
          <p className="contact-status eyebrow muted" role="status">
            {copied ? 'Email copied.' : copyState === 'error' ? 'Unable to copy. You can select the email address in the information card.' : ''}
          </p>
        </div>
        <aside className="glass contact-card" aria-label="Contact information">
          <div><span className="eyebrow">Email</span><p className="contact-email">{email}</p></div>
          <div><span className="eyebrow">Based in</span><p>{portfolio.location}</p></div>
          <div><span className="eyebrow">Focus</span><p>AI / DevOps / Software</p></div>
          <div>
            <span className="eyebrow">Elsewhere</span>
            <div className="socials">{portfolio.socials.map(social => (
              <button key={social.name} type="button" disabled>{social.name} <ArrowUpRight size={15} aria-hidden="true" /></button>
            ))}</div>
            <span className="social-note">Profile links pending</span>
          </div>
        </aside>
      </div>
      <footer className="footer eyebrow">
        <p>© 2026 {portfolio.name}. All rights reserved.</p>
        <a href="#home" data-magnetic onClick={event => {
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            window.dispatchEvent(new Event(PORTRAIT_REFORM));
          }
        }}>Back to top <ArrowUp size={17} aria-hidden="true" /></a>
      </footer>
    </section>
  );
}
