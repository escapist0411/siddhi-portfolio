import About from '@/components/About';
import Contact from '@/components/Contact';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Preloader from '@/components/Preloader';
import Projects from '@/components/Projects';
import SectionMotion from '@/components/SectionMotion';
import Services from '@/components/Services';

export default function Home() {
  return (
    <>
      <Preloader />
      <SectionMotion />
      <div data-intro-content>
        <a className="skip-link" href="#main">Skip to content</a>
        <Navbar />
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Services />
          <Projects />
          <Contact />
        </main>
      </div>
    </>
  );
}
