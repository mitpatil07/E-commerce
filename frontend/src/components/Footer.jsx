// src/components/Footer.jsx
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand & Social Section */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Whatyouwear
            </h3>
            <p className="text-slate-400 max-w-xs mb-6">
              Your one-stop shop for curated electronics, fashion, and home goods.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-slate-500 hover:text-white transition-colors duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter" className="text-slate-500 hover:text-white transition-colors duration-300">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-slate-500 hover:text-white transition-colors duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-500 hover:text-white transition-colors duration-300">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Electronics</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Fashion</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Home Goods</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Books</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-semibold text-white mb-4">Stay in the Loop</h4>
            <p className="text-slate-400 mb-4 text-sm">Subscribe for the latest deals and new product releases.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 bg-slate-700 hover:bg-blue-600 hover:text-white rounded-md transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopHub. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}