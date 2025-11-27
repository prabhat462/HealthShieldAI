import React from 'react';

const ProblemSection: React.FC = () => {
  return (
    <section id="problem" class="py-16 md:py-24 bg-white">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">The Health Insurance Challenge</h2>
                <p class="mt-4 text-lg text-gray-600">
                    Indian consumers face major pain points in their health insurance journey. We're here to fix that.
                </p>
            </div>
            <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Problem Card 1 */}
                <div class="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13.5M12 6.253c1.657 0 3 2.803 3 6.253s-1.343 6.253-3 6.253M12 6.253c-1.657 0-3 2.803-3 6.253s1.343 6.253 3 6.253M12 6.253v13.5"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 8.25c.982 0 1.75.93 1.75 2.083s-.768 2.083-1.75 2.083S6.5 11.313 6.5 10.167s.768-1.917 1.75-1.917zM15.75 8.25c.982 0 1.75.93 1.75 2.083s-.768 2.083-1.75 2.083S14 11.313 14 10.167s.768-1.917 1.75-1.917z"></path></svg>
                    <h3 class="mt-4 text-xl font-semibold text-gray-900">Complex Policies</h3>
                    <p class="mt-2 text-gray-600">Complex language, hidden exclusions, and confusing clauses make policies impossible to understand.</p>
                </div>
                {/* Problem Card 2 */}
                <div class="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h3 class="mt-4 text-xl font-semibold text-gray-900">Delayed & Unfair Claims</h3>
                    <p class="mt-2 text-gray-600">Opaque claim processing leads to frustrating delays and a high rate of unfair rejections.</p>
                </div>
                {/* Problem Card 3 */}
                <div class="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    <h3 class="mt-4 text-xl font-semibold text-gray-900">Lack of Transparency</h3>
                    <p class="mt-2 text-gray-600">Users are left in the dark by both insurers and hospitals, leading to mistrust and disputes.</p>
                </div>
                {/* Problem Card 4 */}
                <div class="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <h3 class="mt-4 text-xl font-semibold text-gray-900">No Proactive Wellness</h3>
                    <p class="mt-2 text-gray-600">The current system is reactive, only offering help *after* you get sick, with no incentive for preventive health.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default ProblemSection;