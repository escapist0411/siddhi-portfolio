import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import Play from '@/components/Play';
import Contact from '@/components/Contact';
export default function Home() {
  return <><a className="skip-link" href="#main">Skip to content</a><Navbar /><main id="main"><Hero /><About /><Services /><Projects /><Play /><Contact /></main></>;
}
