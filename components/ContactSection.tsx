import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Our Future Vision</h2>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                HealthShield AI aims to evolve from an insurance companion to a “Health Risk Intelligence Platform” that predicts medical events, advises on lifestyle-based insurance adjustments, and serves as the AI backbone for next-gen digital insurers.
            </p>
            <div className="mt-12 bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 max-w-3xl mx-auto">
                <h3 className="text-2xl font-semibold">Be part of the future of health.</h3>
                <p className="mt-3 text-gray-400">Join our waitlist for early access and investor updates.</p>
                <form className="mt-8 flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="flex-grow p-4 rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all" 
                      required 
                    />
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        Join Waitlist
                    </button>
                </form>
            </div>
        </div>
    </section>
  );
};

export default ContactSection;