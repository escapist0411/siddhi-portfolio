'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navigation, portfolio } from '@/data/portfolio';
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="navbar"><a className="wordmark" href="#home" onClick={() => setOpen(false)}>{portfolio.name}</a>
    <button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    <nav id="main-navigation" aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>{navigation.map(item => <a href={`#${item}`} key={item} onClick={() => setOpen(false)}>{item}</a>)}</nav>
    <div className="nav-progress" aria-hidden="true"><span /></div>
  </header>;
}
