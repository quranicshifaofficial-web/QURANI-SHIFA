import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UI_LABELS } from '../data/defaultSiteData';
import { Language, LanguageCopy, SectionsVisibility } from '../types/site';
import { SmartImage } from './SmartImage';

interface PublicHeaderProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  copy: LanguageCopy;
  logoUrl: string;
  visibility: SectionsVisibility;
}

export function PublicHeader({
  lang,
  onChangeLang,
  copy,
  logoUrl,
  visibility,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const labels = UI_LABELS[lang];

  const navLinks = [
    visibility.showAbout ? { href: '#about', label: labels.navAbout } : null,
    visibility.showServices ? { href: '#services', label: labels.navServices } : null,
    visibility.showVideos ? { href: '#videos', label: labels.navVideos } : null,
    visibility.showContact ? { href: '#contact', label: labels.navContact } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  const displayBrand =
    lang === 'bn'
      ? copy.institutionName || 'কুরআনী শিফা'
      : lang === 'ar'
      ? copy.institutionName || 'قرآني شفاء'
      : copy.institutionName || 'QURANI SHIFA';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#064E3B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & Emblem */}
        <a
          href="#top"
          className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] rounded-md"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#B48A3E]/35 bg-[#FAF8F3] shrink-0">
            <SmartImage
              src={logoUrl}
              alt={`${displayBrand} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[#064E3B] whitespace-nowrap shrink-0">
            {displayBrand}
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2A3D34]"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#B48A3E] hover:text-[#064E3B] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] rounded-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language Selector + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Language Selector"
            className="inline-flex items-center p-1 rounded-lg bg-[#EFECE3] border border-[#064E3B]/10"
          >
            {(
              [
                { code: 'bn', label: 'বাংলা' },
                { code: 'en', label: 'EN' },
                { code: 'ar', label: 'العربية' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => onChangeLang(opt.code)}
                aria-pressed={lang === opt.code}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[32px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] ${
                  lang === opt.code
                    ? 'bg-[#064E3B] text-[#FAF8F3] shadow-sm'
                    : 'text-[#2A3D34] hover:text-[#064E3B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#064E3B]/15 text-[#064E3B] hover:bg-[#064E3B]/5 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && navLinks.length > 0 && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#064E3B]/10 bg-[#FAF8F3] px-4 py-3 space-y-1"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#17251E] hover:bg-[#064E3B]/5 hover:text-[#064E3B] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
