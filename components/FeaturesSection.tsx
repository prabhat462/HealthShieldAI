import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" class="py-16 md:py-24 bg-gray-50">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">An AI-Powered Ecosystem</h2>
                <p class="mt-4 text-lg text-gray-600">
                    We use advanced AI to simplify every step of your health insurance journey, from selection to claims.
                </p>
            </div>
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature Card 1 */}
                <div class="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <div class="w-12 h-12 text-indigo-500 mb-5">
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 class="text-2xl font-semibold text-gray-900">AI-Guided Policy Selection</h3>
                    <p class="mt-3 text-gray-600">Our AI reads complex policy documents and explains them in plain language. We'll find the perfect plan based on your lifestyle, family, and medical history.</p>
                </div>
                {/* Feature Card 2 */}
                <div class="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <div class="w-12 h-12 text-indigo-500 mb-5">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 class="text-2xl font-semibold text-gray-900">AI-Powered Claims</h3>
                    <p class="mt-3 text-gray-600">Submit claims by just taking a photo. Our AI (OCR+ML) extracts data, validates coverage, and estimates your payout instantly, detecting fraud and overbilling.</p>
                </div>
                {/* Feature Card 3 */}
                <div class="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <div class="w-12 h-12 text-indigo-500 mb-5">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 class="text-2xl font-semibold text-gray-900">Wellness & Prevention</h3>
                    <p class="mt-3 text-gray-600">Get a personalized health score and gamified challenges. Connect your wearables and earn real discounts on your renewal for staying healthy.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default FeaturesSection;