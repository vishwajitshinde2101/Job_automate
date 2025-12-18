import React from 'react';
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
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <StudentSection />
      <WhyWeBuiltSection />
      <Pricing />
      
      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-t from-black to-dark-900 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white">
            Save 3+ Hours Daily. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
              Just Attend HR Calls.
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands of job seekers who provide basic info and let JobAutoApply handle the rest.
          </p>
          <div className="pt-8">
            <Link to="/signup">
                <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 transform">
                Start Saving Time Now
                </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;