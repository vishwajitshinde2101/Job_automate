import React from 'react';
import { Check } from 'lucide-react';
import { PRICING_PLANS } from '../constants';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-gray-400">Invest in your career for less than the price of a pizza.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-dark-800 rounded-2xl border p-8 transition-transform duration-300 hover:scale-105 ${
                plan.isPopular 
                  ? 'border-neon-blue shadow-[0_0_30px_rgba(0,243,255,0.15)] z-10 scale-105' 
                  : 'border-white/10 hover:border-gray-500'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neon-blue text-black font-bold px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2">/ {plan.duration}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-neon-green mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-bold transition-all ${
                plan.isPopular 
                  ? 'bg-neon-blue text-black hover:bg-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
