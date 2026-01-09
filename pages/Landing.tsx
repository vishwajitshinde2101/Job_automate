import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import StudentSection from '../components/StudentSection';
import WhyWeBuiltSection from '../components/WhyWeBuiltSection';
import Pricing from '../components/Pricing';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AutoJobzy - AI Job Application Automation for Naukri & LinkedIn | India</title>
        <meta name="description" content="Automate job applications on Naukri & LinkedIn. AI-powered tool applies to 50+ jobs daily. Save 3+ hours. Trusted by 1000+ Indian job seekers. Get 50% OFF now!" />
        <link rel="canonical" href="https://job-automate.onrender.com/" />
      </Helmet>

      <main>
        <Hero />

        <section aria-label="Statistics">
          <Stats />
        </section>

        <section aria-label="How It Works">
          <HowItWorks />
        </section>

        <section aria-label="Features">
          <Features />
        </section>

        <section aria-label="Student Section">
          <StudentSection />
        </section>

        <section aria-label="Why We Built This">
          <WhyWeBuiltSection />
        </section>

        <section aria-label="Pricing">
          <Pricing />
        </section>
      </main>
    </>
  );
};

export default Landing;
