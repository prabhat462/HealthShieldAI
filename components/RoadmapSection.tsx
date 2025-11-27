import React from 'react';

const RoadmapSection: React.FC = () => {
  return (
    <section id="roadmap" class="py-16 md:py-24 bg-white">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Our Path Forward</h2>
                <p class="mt-4 text-lg text-gray-600">
                    We're on a mission to build a complete Health Risk Intelligence Platform. Here's what's next.
                </p>
            </div>
            <div class="mt-16 max-w-3xl mx-auto">
                <div class="relative pl-8 border-l-2 border-indigo-200">
                    {[
                      {
                        phase: "Phase 1 (0-12 Months)",
                        title: "MVP Launch",
                        desc: "Launch Policy Assistant, AI Claims engine, and the v1 of our ClaimAdvocate AI Chatbot."
                      },
                      {
                        phase: "Phase 2 (12-24 Months)",
                        title: "Scale & Prevention",
                        desc: "Integrate advanced fraud detection, launch the full Wellness Module, and roll out multi-lingual vernacular support."
                      },
                      {
                        phase: "Phase 3 (24-36 Months)",
                        title: "Ecosystem Expansion",
                        desc: "Launch Corporate Health module, Chronic Disease Management programs, and NRI Health extensions."
                      },
                      {
                        phase: "Phase 4 (36+ Months)",
                        title: "Full Intelligence Platform",
                        desc: "Evolve into a full AI-driven RegTech analytics and Health Risk Intelligence platform for the entire industry."
                      }
                    ].map((item, idx) => (
                      <div key={idx} class="mb-10 relative">
                          <div class="absolute w-6 h-6 bg-indigo-600 rounded-full -left-[39px] border-4 border-white shadow-sm"></div>
                          <div class="ml-4">
                              <span class="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">{item.phase}</span>
                              <h3 class="mt-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                              <p class="mt-1 text-gray-600">{item.desc}</p>
                          </div>
                      </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
};

export default RoadmapSection;