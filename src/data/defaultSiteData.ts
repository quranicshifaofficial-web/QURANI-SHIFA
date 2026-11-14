import aboutImg from '../assets/images/about_study_manuscript_1794686527003.jpg';
import heroImg from '../assets/images/hero_islamic_sanctuary_1794686527666.jpg';
import logoImg from '../assets/images/institution_emblem_logo_1794686527014.jpg';
import servicesImg from '../assets/images/service_courtyard_arch_1794686529146.jpg';
import { Language, ServiceItem, SiteSettings } from '../types/site';

export const DEFAULT_IMAGES = {
  logo: logoImg,
  hero: heroImg,
  about: aboutImg,
  services: servicesImg,
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoUrl: DEFAULT_IMAGES.logo,
  heroImageUrl: DEFAULT_IMAGES.hero,
  aboutImageUrl: DEFAULT_IMAGES.about,
  servicesImageUrl: DEFAULT_IMAGES.services,
  publishedUrl: '',
  sectionsVisibility: {
    showHero: true,
    showAbout: true,
    showServices: true,
    showVideos: true,
    showContact: true,
  },
  translations: {
    bn: {
      institutionName: 'কুরআনী শিফা',
      heroKicker: 'অফিসিয়াল প্রাতিষ্ঠানিক ওয়েবসাইট',
      heroHeadline: 'কুরআনী শিফা',
      heroDescription:
        'প্রতিষ্ঠানের অফিসিয়াল পরিচিতি, কার্যক্রম, প্রকাশিত ভিডিও বার্তা ও সরাসরি যোগাযোগের নির্ধারিত স্থান। অ্যাডমিন প্যানেল থেকে প্রতিষ্ঠানের প্রকৃত বিবরণ ও তথ্য হালনাগাদ করা যাবে।',
      heroCtaText: 'সরাসরি যোগাযোগ করুন',
      aboutTitle: 'প্রতিষ্ঠান পরিচিতি',
      aboutSubtitle: 'উদ্দেশ্য ও প্রাতিষ্ঠানিক বিবরণ',
      aboutDescription:
        '[প্রাতিষ্ঠানিক পরিচিতি — অ্যাডমিন প্যানেল থেকে এখানে কুরআনী শিফা প্রতিষ্ঠানের প্রকৃত পরিচিতি, ইতিহাস ও প্রয়োজনীয় তথ্য যুক্ত করুন।]',
      aboutMissionTitle: 'লক্ষ্য ও উদ্দেশ্য',
      aboutMissionText:
        '[লক্ষ্য ও উদ্দেশ্য — অ্যাডমিন প্যানেল থেকে এখানে প্রতিষ্ঠানের সুনির্দিষ্ট লক্ষ্য, উদ্দেশ্য ও নীতিমালা যুক্ত করুন।]',
      servicesTitle: 'সেবা ও তথ্যসমূহ',
      servicesSubtitle: 'প্রতিষ্ঠানের নির্ধারিত কার্যক্রম ও প্রয়োজনীয় তথ্য',
      videoGalleryTitle: 'ভিডিও গ্যালারি',
      videoGallerySubtitle: 'ইউটিউব ও ফেসবুকে প্রকাশিত ভিডিওসমূহ সরাসরি ওয়েবসাইটে দেখুন',
      contactTitle: 'যোগাযোগ ও অফিসিয়াল মাধ্যম',
      contactSubtitle: 'নির্ভরযোগ্য সরাসরি যোগাযোগ ও অফিসিয়াল সামাজিক মাধ্যম',
      footerDescription: 'কুরআনী শিফা (QURANI SHIFA) — অফিসিয়াল প্রাতিষ্ঠানিক ওয়েবসাইট।',
      copyrightText: '© কুরআনী শিফা (QURANI SHIFA)। সর্বস্বত্ব সংরক্ষিত।',
    },
    en: {
      institutionName: 'QURANI SHIFA',
      heroKicker: 'Official Institutional Website',
      heroHeadline: 'QURANI SHIFA',
      heroDescription:
        'The official institutional portal for verified information, services, published video messages, and direct contact channels. Institutional copy can be updated from the admin panel.',
      heroCtaText: 'Contact Directly',
      aboutTitle: 'About the Institution',
      aboutSubtitle: 'Institutional Overview & Purpose',
      aboutDescription:
        '[Institutional Introduction — Please update this section from the Admin Panel with the verified introduction and overview of QURANI SHIFA.]',
      aboutMissionTitle: 'Mission & Objectives',
      aboutMissionText:
        '[Mission & Objectives — Please update this section from the Admin Panel with the institution’s official mission and objectives.]',
      servicesTitle: 'Services & Information',
      servicesSubtitle: 'Organized overview of institutional services and official information',
      videoGalleryTitle: 'Video Gallery',
      videoGallerySubtitle: 'Watch official YouTube and Facebook videos directly on this website',
      contactTitle: 'Contact & Official Channels',
      contactSubtitle: 'Direct communication channels and official social media links',
      footerDescription: 'QURANI SHIFA (কুরআনী শিফা) — Official Institutional Website.',
      copyrightText: '© QURANI SHIFA (কুরআনী শিফা). All rights reserved.',
    },
    ar: {
      institutionName: 'قرآني شفاء',
      heroKicker: 'الموقع المؤسسي الرسمي',
      heroHeadline: 'قرآني شفاء',
      heroDescription:
        'البوابة الرسمية للمؤسسة للتعريف الرسمي والخدمات ومكتبة الفيديو وقنوات التواصل المباشر. يمكن تحديث النصوص والمحتوى من لوحة الإدارة.',
      heroCtaText: 'تواصل معنا مباشرة',
      aboutTitle: 'نبذة عن المؤسسة',
      aboutSubtitle: 'التعريف والأهداف المؤسسية',
      aboutDescription:
        '[التعريف بالمؤسسة — يرجى تحديث هذا النص من لوحة الإدارة لإضافة التعريف الرسمي لمؤسسة قرآني شفاء.]',
      aboutMissionTitle: 'الرسالة والأهداف',
      aboutMissionText:
        '[الرسالة والأهداف — يرجى تحديث هذا القسم من لوحة الإدارة لإضافة الأهداف والرسالة المعتمدة للمؤسسة.]',
      servicesTitle: 'الخدمات والمعلومات',
      servicesSubtitle: 'عرض منظم لخدمات المؤسسة والمعلومات الرسمية',
      videoGalleryTitle: 'معرض الفيديو',
      videoGallerySubtitle: 'شاهد مقاطع يوتيوب وفيسبوك المنشورة مباشرة عبر الموقع',
      contactTitle: 'التواصل والقنوات الرسمية',
      contactSubtitle: 'وسائل الاتصال المباشر والحسابات الرسمية المعتمدة',
      footerDescription: 'قرآني شفاء (QURANI SHIFA) — الموقع المؤسسي الرسمي.',
      copyrightText: '© قرآني شفاء (QURANI SHIFA). جميع الحقوق محفوظة.',
    },
  },
  contact: {
    phone: '',
    whatsapp: '',
    imo: '',
    email: '',
    facebookPageUrl: '',
    messengerUrl: '',
    youtubeChannelUrl: '',
    googleMapsUrl: '',
    addressLabel: '',
  },
};

export const DEFAULT_PLACEHOLDER_SERVICES: ServiceItem[] = [
  {
    id: 'placeholder-service-1',
    order: 1,
    published: true,
    imageUrl: '',
    title: {
      bn: 'প্রাতিষ্ঠানিক তথ্য ও দিকনির্দেশনা (নমুনা)',
      en: 'Institutional Information & Guidance (Placeholder)',
      ar: 'المعلومات والإرشاد المؤسسي (نموذج)',
    },
    description: {
      bn: 'অ্যাডমিন প্যানেল থেকে প্রতিষ্ঠানের প্রকৃত সেবা ও তথ্য যুক্ত করুন অথবা এই নমুনাটি সম্পাদনা করুন।',
      en: 'Add or edit the institution’s verified services and official information from the Admin Panel.',
      ar: 'أضف أو عدّل الخدمات والمعلومات الرسمية المعتمدة للمؤسسة من خلال لوحة الإدارة.',
    },
  },
  {
    id: 'placeholder-service-2',
    order: 2,
    published: true,
    imageUrl: '',
    title: {
      bn: 'অফিসিয়াল পরামর্শ ও যোগাযোগ তথ্য (নমুনা)',
      en: 'Official Consultation & Inquiry Details (Placeholder)',
      ar: 'تفاصيل الاستشارة والتواصل الرسمي (نموذج)',
    },
    description: {
      bn: 'অ্যাডমিন প্যানেল থেকে নির্দিষ্ট সময়সূচি, নিয়মাবলি ও সেবার বিবরণ প্রকাশ করুন।',
      en: 'Publish specific service details, guidance notes, and official procedures via the Admin Panel.',
      ar: 'انشر تفاصيل الخدمات والإرشادات والإجراءات الرسمية عبر لوحة الإدارة.',
    },
  },
];

export interface UiLabelSet {
  navAbout: string;
  navServices: string;
  navVideos: string;
  navContact: string;
  allVideos: string;
  youtubeVideos: string;
  facebookVideos: string;
  watchVideo: string;
  openOriginalVideo: string;
  noVideosYet: string;
  embedUnavailableTitle: string;
  embedUnavailableDesc: string;
  notConfiguredYet: string;
  whatsappLabel: string;
  facebookPageLabel: string;
  messengerLabel: string;
  youtubeChannelLabel: string;
  imoLabel: string;
  emailLabel: string;
  phoneCallLabel: string;
  googleMapsLabel: string;
  quickLinksTitle: string;
  directContactTitle: string;
  openLink: string;
  callNow: string;
  sendEmail: string;
  closePlayer: string;
}

export const UI_LABELS: Record<Language, UiLabelSet> = {
  bn: {
    navAbout: 'পরিচিতি',
    navServices: 'সেবা ও তথ্য',
    navVideos: 'ভিডিও গ্যালারি',
    navContact: 'যোগাযোগ',
    allVideos: 'সকল ভিডিও',
    youtubeVideos: 'ইউটিউব',
    facebookVideos: 'ফেসবুক',
    watchVideo: 'ভিডিও দেখুন',
    openOriginalVideo: 'মূল ভিডিও খুলুন',
    noVideosYet: 'এখনও কোনো প্রকাশিত ভিডিও যুক্ত করা হয়নি। অ্যাডমিন প্যানেল থেকে ইউটিউব বা ফেসবুক ভিডিও যোগ করা যাবে।',
    embedUnavailableTitle: 'এই লিংকটি সরাসরি এমবেড করা যায়নি',
    embedUnavailableDesc: 'গোপনীয়তা বা শর্ট-লিংকের কারণে ভিডিওটি প্লেয়ারে প্রদর্শিত না হলে নিচের বাটনে ক্লিক করে মূল প্ল্যাটফর্মে দেখুন।',
    notConfiguredYet: 'এখনও তথ্য যুক্ত করা হয়নি',
    whatsappLabel: 'হোয়াটসঅ্যাপ (WhatsApp)',
    facebookPageLabel: 'অফিসিয়াল ফেসবুক পেজ',
    messengerLabel: 'ফেসবুক মেসেঞ্জার',
    youtubeChannelLabel: 'ইউটিউব চ্যানেল',
    imoLabel: 'ইমো (IMO)',
    emailLabel: 'জিমেইল / ইমেইল',
    phoneCallLabel: 'সরাসরি ফোন কল',
    googleMapsLabel: 'গুগল ম্যাপস লোকেশন',
    quickLinksTitle: 'দ্রুত নেভিগেশন',
    directContactTitle: 'যোগাযোগ মাধ্যম',
    openLink: 'লিংক খুলুন',
    callNow: 'কল করুন',
    sendEmail: 'ইমেইল পাঠান',
    closePlayer: 'বন্ধ করুন',
  },
  en: {
    navAbout: 'About',
    navServices: 'Services',
    navVideos: 'Videos',
    navContact: 'Contact',
    allVideos: 'All Videos',
    youtubeVideos: 'YouTube',
    facebookVideos: 'Facebook',
    watchVideo: 'Watch Video',
    openOriginalVideo: 'Open Original Video',
    noVideosYet: 'No published videos have been added yet. The administrator can add YouTube and Facebook videos from the Admin Panel.',
    embedUnavailableTitle: 'Direct embedding is restricted for this link',
    embedUnavailableDesc: 'If the video cannot be embedded due to link format or platform privacy settings, open the original video directly below.',
    notConfiguredYet: 'Not yet configured',
    whatsappLabel: 'WhatsApp',
    facebookPageLabel: 'Official Facebook Page',
    messengerLabel: 'Facebook Messenger',
    youtubeChannelLabel: 'YouTube Channel',
    imoLabel: 'IMO',
    emailLabel: 'Gmail / Email',
    phoneCallLabel: 'Direct Phone Call',
    googleMapsLabel: 'Google Maps Location',
    quickLinksTitle: 'Quick Navigation',
    directContactTitle: 'Contact Channels',
    openLink: 'Open Link',
    callNow: 'Call Now',
    sendEmail: 'Send Email',
    closePlayer: 'Close',
  },
  ar: {
    navAbout: 'عن المؤسسة',
    navServices: 'الخدمات',
    navVideos: 'معرض الفيديو',
    navContact: 'التواصل',
    allVideos: 'جميع المقاطع',
    youtubeVideos: 'يوتيوب',
    facebookVideos: 'فيسبوك',
    watchVideo: 'شاهد الفيديو',
    openOriginalVideo: 'فتح الفيديو الأصلي',
    noVideosYet: 'لم يتم نشر مقاطع فيديو بعد. يمكن للإدارة إضافة مقاطع يوتيوب وفيسبوك من لوحة الإدارة.',
    embedUnavailableTitle: 'التضمين المباشر غير متاح لهذا الرابط',
    embedUnavailableDesc: 'إذا تعذر تشغيل الفيديو داخل المشغل بسبب إعدادات الخصوصية أو صيغة الرابط، يمكنك فتحه مباشرة في المنصة الأصلية.',
    notConfiguredYet: 'غير مضاف حالياً',
    whatsappLabel: 'واتساب (WhatsApp)',
    facebookPageLabel: 'صفحة فيسبوك الرسمية',
    messengerLabel: 'فيسبوك ماسنجر',
    youtubeChannelLabel: 'قناة يوتيوب',
    imoLabel: 'إيمو (IMO)',
    emailLabel: 'البريد الإلكتروني',
    phoneCallLabel: 'اتصال هاتفي مباشر',
    googleMapsLabel: 'الموقع على خرائط جوجل',
    quickLinksTitle: 'روابط سريعة',
    directContactTitle: 'قنوات التواصل',
    openLink: 'فتح الرابط',
    callNow: 'اتصل الآن',
    sendEmail: 'إرسال بريد',
    closePlayer: 'إغلاق',
  },
};
