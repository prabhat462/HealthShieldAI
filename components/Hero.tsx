import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 md:pt-40 pb-16 md:pb-24 text-center container mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Smarter Health Insurance.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                Transparent. Preventive. Empowered.
            </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            HealthShield AI is India’s first AI-powered digital ecosystem guiding you from policy discovery to claim processing, all while promoting preventive health and ensuring total transparency.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 text-lg">
                Join the Waitlist
            </a>
            <a href="#features" className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 text-lg">
                Explore Features
            </a>
        </div>
    </section>
  );
};

export default Hero;