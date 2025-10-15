'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function PreAuthNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-slate-100/80 backdrop-blur-xl border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-[#101828]">
              CLOE
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/home"
              className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="/product"
              className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200"
            >
              Product
            </a>
            <a
              href="/about"
              className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200"
            >
              About Us
            </a>
            <button
              onClick={() => {
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.remove('hidden');
              }}
              className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200"
            >
              Contact Sales
            </button>
            <a
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
            >
              Log In
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#475569] hover:text-[#0F172A] transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <a
                href="/home"
                className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="/product"
                className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </a>
              <a
                href="/about"
                className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </a>
              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200 px-4 py-2 text-left"
              >
                Contact Sales
              </button>
              <a
                href="/login"
                className="mx-4 px-6 py-2.5 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <div
        id="contact-modal"
        className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target.id === 'contact-modal') {
            e.target.classList.add('hidden');
          }
        }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Contact Sales</h3>
            <button
              onClick={() => document.getElementById('contact-modal').classList.add('hidden')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us about your needs..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
