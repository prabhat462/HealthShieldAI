import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer class="bg-gray-800 text-gray-400 border-t border-gray-700">
        <div class="container mx-auto px-6 py-12">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="col-span-2 md:col-span-1">
                    <h4 class="text-white font-semibold text-lg flex items-center gap-2"><span>🩺</span> HealthShield AI</h4>
                    <p class="mt-2 text-sm text-gray-500">Smarter Health Insurance. Transparent. Preventive. Empowered.</p>
                </div>
                <div>
                    <h5 class="font-semibold text-gray-200">Product</h5>
                    <ul class="mt-3 space-y-2 text-sm">
                        <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#chatbot" class="hover:text-white transition-colors">Advocate AI</a></li>
                        <li><a href="#compare" class="hover:text-white transition-colors">Compare</a></li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-semibold text-gray-200">Company</h5>
                    <ul class="mt-3 space-y-2 text-sm">
                        <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Partners</a></li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-semibold text-gray-200">Legal</h5>
                    <ul class="mt-3 space-y-2 text-sm">
                        <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                <p>&copy; 2025 HealthShield AI. All rights reserved.</p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition-colors">Twitter</a>
                    <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" class="hover:text-white transition-colors">Instagram</a>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;