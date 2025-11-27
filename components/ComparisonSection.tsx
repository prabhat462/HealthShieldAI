import React from 'react';

const ComparisonSection: React.FC = () => {
  return (
    <section id="compare" class="py-16 md:py-24 bg-gray-50">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">The HealthShield AI Difference</h2>
                <p class="mt-4 text-lg text-gray-600">
                    See how our AI-first approach stacks up against traditional insurance platforms.
                </p>
            </div>
            <div class="mt-12 shadow-xl rounded-lg overflow-hidden border border-gray-200">
                <div class="overflow-x-auto">
                    <table class="w-full divide-y divide-gray-200 min-w-[600px]">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">Factor</th>
                                <th class="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/3">Traditional Insurer Apps</th>
                                <th class="py-4 px-6 text-left text-xs font-bold text-indigo-700 bg-indigo-50 uppercase tracking-wider w-1/3">🩺 HealthShield AI</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {[
                                { factor: "Policy Understanding", trad: "Text-heavy, confusing PDFs", us: "AI-simplified summaries in plain language" },
                                { factor: "Claims Process", trad: "Manual, paper-based, slow", us: "Automated with AI verification & instant updates" },
                                { factor: "Fraud Control", trad: "Reactive, post-claim audits", us: "Predictive ML detects overbilling & fraud in real-time" },
                                { factor: "Customer Support", trad: "Limited-hour call centers", us: "24/7 AI Advocate Chatbot for expert help" },
                                { factor: "Wellness Integration", trad: "Minimal to non-existent", us: "Full preventive ecosystem with discounts" },
                                { factor: "Accessibility", trad: "English-only, complex UI", us: "Multilingual + Voice-enabled for all of India" },
                            ].map((row, idx) => (
                                <tr key={idx} class={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                                    <td class="py-5 px-6 font-medium text-gray-900">{row.factor}</td>
                                    <td class="py-5 px-6 text-gray-600">{row.trad}</td>
                                    <td class="py-5 px-6 font-medium text-gray-800 bg-indigo-50 border-l border-indigo-100 relative">
                                      {idx === 0 && <span class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">WINNER</span>}
                                      {row.us}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
  );
};

export default ComparisonSection;