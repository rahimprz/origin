import Hero from './home/Hero.jsx';
import Process from './home/Process.jsx';
import Catalogue from './home/Catalogue.jsx';
import { About, Distribution, Faq, Portfolio, ReelBand, StartCta, Voices } from './home/Sections.jsx';
import { usePageTitle } from '../site/usePageTitle.js';
import { BRAND } from '../../shared/brand.js';

export default function Home() {
  usePageTitle(`${BRAND.name} | Book Publishing for Authors`);
  return (
    <>
      <Hero />
      <Process />
      <Catalogue />
      <Portfolio />
      <Distribution />
      <About />
      <Voices />
      <ReelBand />
      <Faq />
      <StartCta />
    </>
  );
}
