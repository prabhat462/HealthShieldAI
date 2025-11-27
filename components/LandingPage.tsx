import React from 'react';

const LandingPage: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus or highlight the Google Login button logic could go here
    const btn = document.getElementById('googleBtn');
    if(btn) btn.classList.add('ring-4', 'ring-indigo-300');
    setTimeout(() => {
        if(btn) btn.classList.remove('ring-4', 'ring-indigo-300');
    }, 1000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wide mb-6">
                <span>🚀</span> Now Live in Beta
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Your Health Insurance <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">On Autopilot.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                The all-in-one AI platform to organize, understand, and optimize your health coverage. 
                Upload policies, predict claim success, and get instant answers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                    onClick={scrollToTop}
                    className="bg-gray-900 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                >
                    Get Started for Free
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
                <a href="#features" className="bg-white text-gray-900 font-bold py-4 px-8 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 text-lg">
                    See How It Works
                </a>
            </div>
            
            {/* Social Proof / Trust */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-4">Trusted Technology Partner</p>
                <div className="flex gap-8 opacity-50 grayscale">
                    {/* Simple text placeholders for logos to keep it clean */}
                    <span className="text-xl font-bold text-gray-400">Google Cloud</span>
                    <span className="text-xl font-bold text-gray-400">Cloudflare</span>
                    <span className="text-xl font-bold text-gray-400">Gemini</span>
                </div>
            </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Value Props Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Everything you need to manage risk.</h2>
                <p className="mt-4 text-gray-600">Stop wrestling with PDFs and call centers. HealthShield AI gives you the tools to take control.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    {
                        icon: "🛡️",
                        title: "Advocate AI Chatbot",
                        desc: "Your 24/7 expert. Ask questions about your coverage, exclusions, or get help drafting appeal letters for rejected claims."
                    },
                    {
                        icon: "📂",
                        title: "Secure Health Locker",
                        desc: "Bank-grade encryption for your policies and medical reports. Access them anywhere, instantly organised by AI."
                    },
                    {
                        icon: "⚖️",
                        title: "Smart Policy Compare",
                        desc: "Don't just compare premiums. Compare hidden clauses, co-pay limits, and room rent caps side-by-side."
                    },
                    {
                        icon: "🔍",
                        title: "Claim Pre-Assessor",
                        desc: "Upload a bill and policy before submitting. Our AI predicts approval probability and flags potential deduction risks."
                    },
                    {
                        icon: "⚡",
                        title: "Instant Digitization",
                        desc: "Turn physical paper files into searchable digital assets. Our OCR engine captures every detail."
                    },
                    {
                        icon: "🔒",
                        title: "Privacy First",
                        desc: "Your health data is yours. We use enterprise-grade security and you control your data retention."
                    }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to empower your health journey?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                Join thousands of users who are saving money and avoiding claim rejections with HealthShield AI.
            </p>
            <button 
                onClick={scrollToTop}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
                Create Free Account
            </button>
            <p className="mt-6 text-sm text-gray-500">No credit card required • GDPR Compliant</p>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>
      </section>
    </div>
  );
};

export default LandingPage;