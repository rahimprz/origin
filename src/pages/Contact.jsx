import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSite } from '../site/SiteContext.jsx';
import { usePageTitle } from '../site/usePageTitle.js';
import { BRAND } from '../../shared/brand.js';
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { EnquiryForm, Faq, Offices } from './home/Sections.jsx';

export default function Contact() {
  const { openPlanner } = useSite();
  const root = useRef(null);
  usePageTitle(`Start your book | ${BRAND.name}`, `Tell ${BRAND.name} about your book: where it is today and the help you are looking for.`);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create('.contact__title', { type: 'lines', mask: 'lines' });
      gsap.timeline().from(split.lines, { yPercent: 105, stagger: 0.08, duration: 1 }).from('.contact__lede, .contact__alt, .offices, .contact__form', { y: 18, autoAlpha: 0, stagger: 0.08 }, 0.3);
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section className="contact" data-ink="paper" data-spine="01|Start your book|house" aria-labelledby="contact-title">
        <div className="contact__copy">
          <h1 id="contact-title" className="contact__title">
            Start your book
          </h1>
          <p className="contact__lede">Bring an idea, a stack of notes, half a draft or a finished manuscript. Tell us where your book is today and we will reply with what it needs next.</p>
          <p className="contact__alt">
            Prefer to go step by step?{' '}
            <button type="button" className="link-arrow" onClick={() => openPlanner()}>
              Use the book planner <ArrowRight aria-hidden="true" />
            </button>
          </p>
          <Offices />
        </div>
        <div className="contact__form" data-ink="house">
          <h2 className="contact__formtitle">Send an enquiry</h2>
          <EnquiryForm source="contact" compact />
        </div>
      </section>
      <Faq spine="02|Common questions|house" />
    </div>
  );
}
