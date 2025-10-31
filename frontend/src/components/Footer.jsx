// src/components/Footer.jsx
import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import logo from "../assets/wyw_logo.png";

export default function Footer() {
  const [openSection, setOpenSection] = React.useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .footer-title, .section-heading, .footer-link {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        .footer-title {
          font-weight: 900;
          letter-spacing: -0.04em;
        }
        .section-heading {
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .footer-link {
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-in-out;
        }
        .accordion-content.open {
          max-height: 500px;
        }
      `}</style>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

        {/* ---------- MOBILE VIEW ---------- */}
        <div className="block lg:hidden space-y-4">

          {/* Accordion Section Generator */}
          {[
            {
              key: "shop",
              title: "Shop",
              items: ["T-Shirts", "Hoodies", "Jeans", "Accessories"],
            },
            {
              key: "help",
              title: "Help",
              items: ["Help Center", "Shipping Info", "Returns", "Contact Us"],
            },
          ].map(({ key, title, items }) => (
            <div key={key} className="border-b border-gray-800">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex justify-between items-center py-4 text-left"
              >
                <span className="section-heading text-base uppercase">{title}</span>
                <span className="text-2xl">{openSection === key ? "−" : "+"}</span>
              </button>

              <div className={`accordion-content ${openSection === key ? "open" : ""}`}>
                <ul className="space-y-3 text-gray-400 pb-4">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="footer-link text-sm hover:text-white transition-colors duration-300 uppercase"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Mobile Logo + Socials */}
          <div className="mt-10 flex flex-col items-center">
            <img
              src={logo}
              alt="WhatYouWear Logo"
              className="h-18 w-auto object-contain mb-5"
            />
            <div className="flex space-x-6">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-white hover:text-gray-400 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- DESKTOP VIEW ---------- */}
        <div className="hidden lg:grid grid-cols-4 ml-32">
          {/* Brand & Description */}
          <div className="col-span-2">
            <img
              src={logo}
              alt="WhatYouWear Logo"
              className="h-18 w-auto object-contain mb-6"
            />
            <p className="text-gray-400 text-sm max-w-xs mb-6 uppercase tracking-wide">
              Your one-stop shop for curated fashion and style.
            </p>

            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={Icon.name}
                  className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="section-heading text-base mb-4 uppercase">Shop</h4>
            <ul className="space-y-3 text-gray-400">
              {["T-Shirts", "Hoodies", "Jeans", "Accessories"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="footer-link text-sm hover:text-white transition-colors uppercase"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="section-heading text-base mb-4 uppercase">Support</h4>
            <ul className="space-y-3 text-gray-400">
              {["Help Center", "Shipping Info", "Returns", "Contact Us"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="footer-link text-sm hover:text-white transition-colors uppercase"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- BOTTOM COPYRIGHT BAR ---------- */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
            <p className="footer-link uppercase mb-4 md:mb-0 text-center md:text-left">
              © {new Date().getFullYear()} WhatYouWear — All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a
                href="#"
                className="footer-link hover:text-white transition-colors uppercase"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="footer-link hover:text-white transition-colors uppercase"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
