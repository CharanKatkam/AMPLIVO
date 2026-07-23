'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Social Media Marketing', href: '/services/social-media-marketing' },
      { label: 'Performance Marketing', href: '/services/performance-marketing' },
      { label: 'SEO', href: '/services/search-engine-optimisation' },
      { label: 'Branding & Creative', href: '/services/branding-and-creative-design' },
      { label: 'Content Marketing', href: '/services/content-marketing' },
      { label: 'Lead Generation', href: '/services/lead-generation' },
      { label: 'Website Development', href: '/services/website-development' },
      { label: 'Marketing Automation', href: '/services/marketing-automation' },
      { label: 'Influencer Marketing', href: '/services/influencer-marketing' },
      { label: 'Video Marketing', href: '/services/video-marketing' },
    ],
  },
  { label: 'Industries', href: '/industries' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

interface NavbarProps {
  alwaysSolid?: boolean;
}

export function Navbar({ alwaysSolid = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isSolid = alwaysSolid || scrolled;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? 'bg-white/97 backdrop-blur-md border-b border-slate-200 shadow-md'
          : 'bg-[#1a0540]/60 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4" style={{ height: 72 }}>
        {/* Logo */}
        <Logo variant={isSolid ? 'dark' : 'white'} />

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-2">
          {navLinks.map((link) => {
            const linkActive = isActive(link.href);
            const hasActiveChild = link.children?.some((c) => isActive(c.href));
            return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSolid
                      ? linkActive || hasActiveChild
                        ? 'text-[#4C1D95] font-bold bg-[#4C1D95]/5'
                        : 'text-slate-600 hover:text-[#4C1D95] hover:bg-[#4C1D95]/5'
                      : linkActive || hasActiveChild
                        ? 'text-white font-bold bg-white/10'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />}
                </Link>

                {(linkActive || hasActiveChild) && (
                  <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${isSolid ? 'bg-[#4C1D95]' : 'bg-white'}`} />
                )}

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-black/10 p-2 z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive(child.href)
                            ? 'text-[#4C1D95] font-bold bg-[#4C1D95]/5'
                            : 'text-slate-600 hover:text-[#4C1D95] hover:bg-[#4C1D95]/5'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="hidden xl:flex items-center gap-4">
          <Link
            href="/login"
            className={`text-sm font-medium px-5 py-2.5 rounded-xl border transition-all ${isSolid
              ? 'border-slate-200 text-slate-700 hover:border-[#4C1D95] hover:text-[#4C1D95]'
              : 'border-white/30 text-white hover:bg-white/10'
              }`}
          >
            Client Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`xl:hidden p-2 rounded-lg transition-colors ${isSolid ? 'text-slate-700' : 'text-white'}`}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-slate-100 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const linkActive = isActive(link.href);
              const hasActiveChild = link.children?.some((c) => isActive(c.href));
              return (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      linkActive || hasActiveChild
                        ? 'text-[#4C1D95] font-bold bg-[#4C1D95]/5'
                        : 'text-slate-700 hover:text-[#4C1D95] hover:bg-[#4C1D95]/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-4 py-2 text-xs rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'text-[#4C1D95] font-bold bg-[#4C1D95]/5'
                              : 'text-slate-500 hover:text-[#4C1D95]'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-medium border border-slate-200 text-slate-700 rounded-xl hover:border-[#4C1D95] hover:text-[#4C1D95]">
                Client Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
