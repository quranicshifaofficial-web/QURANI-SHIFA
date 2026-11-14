export type Language = 'bn' | 'en' | 'ar';

export interface LocalizedText {
  bn: string;
  en: string;
  ar: string;
}

export interface LanguageCopy {
  institutionName: string;
  heroKicker: string;
  heroHeadline: string;
  heroDescription: string;
  heroCtaText: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutMissionTitle: string;
  aboutMissionText: string;
  servicesTitle: string;
  servicesSubtitle: string;
  videoGalleryTitle: string;
  videoGallerySubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  footerDescription: string;
  copyrightText: string;
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  imo: string;
  email: string;
  facebookPageUrl: string;
  messengerUrl: string;
  youtubeChannelUrl: string;
  googleMapsUrl: string;
  addressLabel: string;
}

export interface SectionsVisibility {
  showHero: boolean;
  showAbout: boolean;
  showServices: boolean;
  showVideos: boolean;
  showContact: boolean;
}

export interface SiteSettings {
  logoUrl: string;
  heroImageUrl: string;
  aboutImageUrl: string;
  servicesImageUrl: string;
  publishedUrl: string;
  sectionsVisibility: SectionsVisibility;
  translations: {
    bn: LanguageCopy;
    en: LanguageCopy;
    ar: LanguageCopy;
  };
  contact: ContactInfo;
  updatedAt?: unknown;
  updatedBy?: string;
}

export interface ServiceItem {
  id: string;
  order: number;
  published: boolean;
  imageUrl: string;
  title: LocalizedText;
  description: LocalizedText;
  createdAt?: unknown;
  updatedAt?: unknown;
  updatedBy?: string;
}

export type VideoPlatform = 'youtube' | 'facebook';

export interface VideoItem {
  id: string;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnailUrl: string;
  order: number;
  published: boolean;
  title: LocalizedText;
  description: LocalizedText;
  createdAt?: unknown;
  updatedAt?: unknown;
  updatedBy?: string;
}

export interface AdminRecord {
  uid: string;
  email: string;
  addedBy: string;
  createdAt?: unknown;
}
