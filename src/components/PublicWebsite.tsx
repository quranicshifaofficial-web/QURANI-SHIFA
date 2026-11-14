import { ArrowRight, BookOpenCheck, PhoneCall } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DEFAULT_PLACEHOLDER_SERVICES,
  DEFAULT_SITE_SETTINGS,
  UI_LABELS,
} from '../data/defaultSiteData';
import {
  subscribePublicSiteSettings,
  subscribePublishedServices,
  subscribePublishedVideos,
} from '../lib/siteService';
import { normalizeExternalUrl } from '../lib/videoEmbed';
import { Language, ServiceItem, SiteSettings, VideoItem } from '../types/site';
import { ContactSection } from './ContactSection';
import { PublicHeader } from './PublicHeader';
import { SmartImage } from './SmartImage';
import { VideoGallerySection } from './VideoGallerySection';

function getInitialLanguage(): Language {
  try {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'bn' || paramLang === 'en' || paramLang === 'ar') return paramLang;
    const saved = localStorage.getItem('qs_lang');
    if (saved === 'bn' || saved === 'en' || saved === 'ar') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'bn';
}

export function PublicWebsite() {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    const unsubSettings = subscribePublicSiteSettings((next) => {
      setSettings(next);
    });
    const unsubServices = subscribePublishedServices(
      (items) => {
        setServices(items);
        setServicesLoaded(true);
      },
      () => setServicesLoaded(true)
    );
    const unsubVideos = subscribePublishedVideos(
      (items) => {
        setVideos(items);
        setVideosLoading(false);
      },
      () => setVideosLoading(false)
    );

    return () => {
      unsubSettings();
      unsubServices();
      unsubVideos();
    };
  }, []);

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
    try {
      localStorage.setItem('qs_lang', nextLang);
    } catch {
      // Ignore
    }
  };

  // Sync HTML lang, RTL direction, SEO title, description, canonical URL, and JSON-LD
  useEffect(() => {
    const isRtl = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    const copy = settings.translations[lang];
    document.title =
      lang === 'bn'
        ? `${copy.institutionName} | QURANI SHIFA — অফিসিয়াল ওয়েবসাইট`
        : lang === 'ar'
        ? `${copy.institutionName} | QURANI SHIFA — الموقع الرسمي`
        : `${copy.institutionName} (কুরআনী শিফা) — Official Website`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && copy.heroDescription) {
      metaDesc.setAttribute('content', copy.heroDescription.slice(0, 160));
    }

    const canonicalUrl =
      settings.publishedUrl?.trim() || `${window.location.origin}${window.location.pathname}`;
    const canonicalEl = document.getElementById('canonical-link');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', canonicalUrl);
    }

    const jsonLdEl = document.getElementById('org-jsonld');
    if (jsonLdEl) {
      const sameAs = [
        settings.contact.facebookPageUrl,
        settings.contact.youtubeChannelUrl,
      ]
        .filter(Boolean)
        .map(normalizeExternalUrl);

      const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'QURANI SHIFA',
        alternateName: ['কুরআনী শিফা', 'قرآني شفاء'],
        url: canonicalUrl,
      };
      if (settings.contact.email) ld.email = settings.contact.email;
      if (settings.contact.phone) ld.telephone = settings.contact.phone;
      if (sameAs.length > 0) ld.sameAs = sameAs;
      jsonLdEl.textContent = JSON.stringify(ld);
    }
  }, [lang, settings]);

  const copy = settings.translations[lang];
  const labels = UI_LABELS[lang];
  const vis = settings.sectionsVisibility;

  const displayedServices =
    servicesLoaded && services.length > 0 ? services : DEFAULT_PLACEHOLDER_SERVICES;

  const fontClass =
    lang === 'ar' ? 'font-ar' : lang === 'bn' ? 'font-bn' : 'font-en';
  const displayFontClass =
    lang === 'ar' ? 'font-ar-display' : lang === 'bn' ? 'font-bn-display' : 'font-en-display';

  return (
    <div id="top" className={`min-h-screen flex flex-col bg-[#FAF8F3] text-[#17251E] ${fontClass}`}>
      <PublicHeader
        lang={lang}
        onChangeLang={handleLanguageChange}
        copy={copy}
        logoUrl={settings.logoUrl}
        visibility={vis}
      />

      <main className="flex-1">
        {/* B. Hero Section */}
        {vis.showHero && (
          <section className="relative overflow-hidden islamic-lattice-bg py-14 sm:py-20 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Copy Column */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#B48A3E] mb-3">
                    {copy.heroKicker}
                  </p>
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-[#064E3B] leading-[1.15] tracking-tight text-balance ${displayFontClass}`}
                  >
                    {copy.heroHeadline}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#52655B]">
                    <span>কুরআনী শিফা</span>
                    <span aria-hidden="true">·</span>
                    <span>QURANI SHIFA</span>
                    <span aria-hidden="true">·</span>
                    <span dir="rtl" className="font-ar">
                      قرآني شفاء
                    </span>
                  </div>
                  <p className="mt-6 text-base sm:text-lg text-[#2A3D34] leading-relaxed max-w-xl">
                    {copy.heroDescription}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#064E3B] text-[#FAF8F3] font-semibold text-sm sm:text-base hover:bg-[#053D2E] transition-colors duration-150 shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2"
                    >
                      <PhoneCall className="w-4 h-4 text-[#C9A254]" />
                      <span>{copy.heroCtaText}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </a>
                    {vis.showVideos && (
                      <a
                        href="#videos"
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-[#064E3B]/25 text-[#064E3B] font-semibold text-sm sm:text-base hover:bg-[#064E3B]/5 transition-colors duration-150 whitespace-nowrap"
                      >
                        <span>{labels.navVideos}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Architectural Visual */}
                <div className="lg:col-span-6 flex">
                  <div className="w-full rounded-2xl overflow-hidden border border-[#B48A3E]/30 bg-[#064E3B] shadow-sm min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                    <SmartImage
                      src={settings.heroImageUrl}
                      alt={`${copy.institutionName} — ${copy.heroKicker}`}
                      fallbackTitle={copy.institutionName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* C. About Section */}
        {vis.showAbout && (
          <section
            id="about"
            className="py-16 sm:py-24 bg-white border-t border-[#064E3B]/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
                <div className="lg:col-span-5 flex">
                  <div className="w-full rounded-2xl overflow-hidden border border-[#064E3B]/15 bg-[#FAF8F3] min-h-[260px] lg:min-h-[380px]">
                    <SmartImage
                      src={settings.aboutImageUrl}
                      alt={copy.aboutTitle}
                      fallbackTitle={copy.aboutTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#B48A3E] mb-2">
                    {copy.aboutSubtitle}
                  </p>
                  <h2
                    className={`text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight text-balance ${displayFontClass}`}
                  >
                    {copy.aboutTitle}
                  </h2>

                  <div className="mt-6 max-w-prose space-y-6">
                    <p className="text-base sm:text-lg text-[#2A3D34] leading-[1.8] whitespace-pre-line">
                      {copy.aboutDescription}
                    </p>

                    <div className="pt-6 border-t border-[#064E3B]/12">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#064E3B] mb-2">
                        {copy.aboutMissionTitle}
                      </h3>
                      <p className="text-base text-[#40544A] leading-[1.8] whitespace-pre-line">
                        {copy.aboutMissionText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* D. Services / Information Section */}
        {vis.showServices && (
          <section
            id="services"
            className="py-16 sm:py-24 bg-[#FAF8F3] border-t border-[#064E3B]/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-5">
                  <h2
                    className={`text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight text-balance ${displayFontClass}`}
                  >
                    {copy.servicesTitle}
                  </h2>
                  <p className="mt-3 text-base text-[#40544A] leading-relaxed">
                    {copy.servicesSubtitle}
                  </p>
                  <div className="mt-6 rounded-2xl overflow-hidden border border-[#064E3B]/15 aspect-[4/3] bg-[#064E3B]">
                    <SmartImage
                      src={settings.servicesImageUrl}
                      alt={copy.servicesTitle}
                      fallbackTitle={copy.servicesTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {displayedServices.map((srv, idx) => {
                    const srvTitle =
                      srv.title[lang] || srv.title.en || srv.title.bn || srv.title.ar;
                    const srvDesc =
                      srv.description[lang] ||
                      srv.description.en ||
                      srv.description.bn ||
                      srv.description.ar;

                    return (
                      <article
                        key={srv.id}
                        className="rounded-xl border border-[#064E3B]/12 bg-white overflow-hidden flex flex-col"
                      >
                        {srv.imageUrl ? (
                          <div className="aspect-[16/10] w-full overflow-hidden bg-[#EFECE3]">
                            <SmartImage
                              src={srv.imageUrl}
                              alt={srvTitle}
                              fallbackTitle={srvTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#B48A3E] mb-2 tabular-nums">
                            <BookOpenCheck className="w-4 h-4" />
                            <span>{String(idx + 1).padStart(2, '0')}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-[#17251E] leading-snug">
                            {srvTitle}
                          </h3>
                          <p className="mt-2.5 text-sm text-[#40544A] leading-relaxed whitespace-pre-line">
                            {srvDesc}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* E. Video Gallery Section */}
        {vis.showVideos && (
          <VideoGallerySection
            lang={lang}
            title={copy.videoGalleryTitle}
            subtitle={copy.videoGallerySubtitle}
            videos={videos}
            loading={videosLoading}
          />
        )}

        {/* F. Contact & Social Media Section */}
        {vis.showContact && (
          <ContactSection
            lang={lang}
            title={copy.contactTitle}
            subtitle={copy.contactSubtitle}
            contact={settings.contact}
          />
        )}
      </main>

      {/* G. Footer */}
      <footer className="islamic-emerald-lattice text-[#FAF8F3] border-t border-[#C9A254]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#FAF8F3]/15">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C9A254]/50 bg-[#FAF8F3] shrink-0">
                  <SmartImage
                    src={settings.logoUrl}
                    alt={`${copy.institutionName} Logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#FAF8F3]">
                    {copy.institutionName}
                  </div>
                  <div className="text-xs text-[#C9A254] mt-0.5">
                    কুরআনী শিফা · QURANI SHIFA · قرآني شفاء
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#FAF8F3]/80 leading-relaxed max-w-md">
                {copy.footerDescription}
              </p>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold tracking-wider text-[#C9A254] mb-4">
                {labels.quickLinksTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-[#FAF8F3]/85">
                {vis.showAbout && (
                  <li>
                    <a href="#about" className="hover:text-[#C9A254] transition-colors">
                      {labels.navAbout}
                    </a>
                  </li>
                )}
                {vis.showServices && (
                  <li>
                    <a href="#services" className="hover:text-[#C9A254] transition-colors">
                      {labels.navServices}
                    </a>
                  </li>
                )}
                {vis.showVideos && (
                  <li>
                    <a href="#videos" className="hover:text-[#C9A254] transition-colors">
                      {labels.navVideos}
                    </a>
                  </li>
                )}
                {vis.showContact && (
                  <li>
                    <a href="#contact" className="hover:text-[#C9A254] transition-colors">
                      {labels.navContact}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-xs font-semibold tracking-wider text-[#C9A254] mb-4">
                {labels.directContactTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-[#FAF8F3]/85">
                {settings.contact.phone && (
                  <li>
                    <a
                      href={`tel:${settings.contact.phone.replace(/\s+/g, '')}`}
                      className="hover:text-[#C9A254] transition-colors"
                      dir="ltr"
                    >
                      {settings.contact.phone}
                    </a>
                  </li>
                )}
                {settings.contact.email && (
                  <li>
                    <a
                      href={`mailto:${settings.contact.email}`}
                      className="hover:text-[#C9A254] transition-colors break-all"
                      dir="ltr"
                    >
                      {settings.contact.email}
                    </a>
                  </li>
                )}
                {settings.contact.addressLabel && (
                  <li className="text-[#FAF8F3]/75">{settings.contact.addressLabel}</li>
                )}
                <li className="pt-1 flex flex-wrap gap-4 text-xs">
                  {settings.contact.facebookPageUrl && (
                    <a
                      href={normalizeExternalUrl(settings.contact.facebookPageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#C9A254]"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.contact.youtubeChannelUrl && (
                    <a
                      href={normalizeExternalUrl(settings.contact.youtubeChannelUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#C9A254]"
                    >
                      YouTube
                    </a>
                  )}
                  {settings.contact.googleMapsUrl && (
                    <a
                      href={normalizeExternalUrl(settings.contact.googleMapsUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#C9A254]"
                    >
                      Google Maps
                    </a>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F3]/75">
            <p>{copy.copyrightText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
