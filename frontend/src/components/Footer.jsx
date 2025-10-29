// src/components/Footer.jsx - Updated with CategoryProducts theme
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-2 border-gray-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .footer-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        
        .section-heading {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        
        .footer-link {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
      `}</style>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand & Social Section */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="footer-title text-2xl sm:text-3xl text-white mb-4 uppercase">
              Whatyouwear
            </h3>
            <p className="text-gray-400 max-w-xs mb-6 text-sm sm:text-base uppercase tracking-wide">
              Your one-stop shop for curated fashion and style.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                aria-label="Facebook" 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="#" 
                aria-label="Twitter" 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="#" 
                aria-label="LinkedIn" 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="section-heading text-sm sm:text-base text-white mb-4 uppercase">Shop</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  T-Shirts
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Hoodies
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Jeans
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Accessories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="section-heading text-sm sm:text-base text-white mb-4 uppercase">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-xs sm:text-sm hover:text-white transition-colors duration-300 uppercase">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="section-heading text-sm sm:text-base text-white mb-4 uppercase">
              Stay in the Loop
            </h4>
            <p className="text-gray-400 mb-4 text-xs sm:text-sm uppercase tracking-wide">
              Subscribe for the latest deals
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="YOUR EMAIL"
                className="w-full bg-white border-2 border-gray-300 text-black px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder:text-gray-400 placeholder:uppercase text-xs sm:text-sm font-bold"
              />
              <button 
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-black hover:bg-gray-800 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
          <p className="footer-link uppercase">
            &copy; {new Date().getFullYear()} Whatyouwear. All Rights Reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6 mt-4 md:mt-0">
            <a href="#" className="footer-link hover:text-white transition-colors uppercase">
              Privacy Policy
            </a>
            <a href="#" className="footer-link hover:text-white transition-colors uppercase">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}