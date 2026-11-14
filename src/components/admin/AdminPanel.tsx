import { User, signOut } from 'firebase/auth';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  Phone,
  QrCode,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaultSiteData';
import { auth, uploadImageAsset } from '../../lib/firebase';
import {
  addAuthorizedAdmin,
  BOOTSTRAPPED_ADMIN_EMAIL,
  removeAuthorizedAdmin,
  saveSiteSettings,
  subscribeAdminRecords,
  subscribeAllServicesAdmin,
  subscribeAllVideosAdmin,
  subscribePublicSiteSettings,
} from '../../lib/siteService';
import {
  AdminRecord,
  Language,
  LanguageCopy,
  ServiceItem,
  SiteSettings,
  VideoItem,
} from '../../types/site';
import { SmartImage } from '../SmartImage';
import { AdminQrTab } from './AdminQrTab';
import { AdminServicesTab } from './AdminServicesTab';
import { AdminVideosTab } from './AdminVideosTab';

type AdminTab =
  | 'dashboard'
  | 'content'
  | 'services'
  | 'videos'
  | 'contact'
  | 'images'
  | 'languages'
  | 'qr'
  | 'admins';

interface AdminPanelProps {
  user: User;
  onNavigateHome: () => void;
}

export function AdminPanel({ user, onNavigateHome }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [dbInitialized, setDbInitialized] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  const [editLang, setEditLang] = useState<Language>('bn');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    const unsubSettings = subscribePublicSiteSettings((next, existsInDb) => {
      setDraft(next);
      setDbInitialized(existsInDb);
    });
    const unsubServices = subscribeAllServicesAdmin(setServices);
    const unsubVideos = subscribeAllVideosAdmin(setVideos);
    const unsubAdmins = subscribeAdminRecords(setAdmins);

    return () => {
      unsubSettings();
      unsubServices();
      unsubVideos();
      unsubAdmins();
    };
  }, []);

  const handleSaveSettings = async (override?: SiteSettings) => {
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      await saveSiteSettings(override ?? draft);
      setSaveSuccess('পরিবর্তনসমূহ স্থায়ীভাবে সংরক্ষিত ও প্রকাশিত হয়েছে। (Changes saved and published.)');
      setDbInitialized(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const updateLangField = (lang: Language, field: keyof LanguageCopy, value: string) => {
    setDraft((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value,
        },
      },
    }));
  };

  const handleImageFileUpload = async (
    field: 'logoUrl' | 'heroImageUrl' | 'aboutImageUrl' | 'servicesImageUrl',
    file: File | undefined
  ) => {
    if (!file) return;
    setUploadingField(field);
    setSaveError('');
    try {
      const result = await uploadImageAsset(file, field);
      setDraft((prev) => ({ ...prev, [field]: result.url }));
      setSaveSuccess('নতুন ছবির প্রিভিউ প্রস্তুত। প্রকাশ করতে "পরিবর্তন সংরক্ষণ করুন" বাটনে ক্লিক করুন।');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    try {
      await addAuthorizedAdmin(newAdminUid, newAdminEmail);
      setNewAdminUid('');
      setNewAdminEmail('');
      setSaveSuccess('নতুন অনুমোদিত অ্যাডমিন যুক্ত করা হয়েছে।');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not add admin.');
    }
  };

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Overview)', icon: LayoutDashboard },
    { id: 'content', label: 'ওয়েবসাইট কনটেন্ট ও সেকশন', icon: FileText },
    { id: 'services', label: 'সেবা ও তথ্য (Services)', icon: Layers },
    { id: 'videos', label: 'ভিডিও গ্যালারি (Videos)', icon: Video },
    { id: 'contact', label: 'যোগাযোগ ও লিংক (Contact)', icon: Phone },
    { id: 'images', label: 'লোগো ও ছবি (Images)', icon: ImageIcon },
    { id: 'languages', label: 'ভাষা ব্যবস্থাপনা (BN/EN/AR)', icon: Globe },
    { id: 'qr', label: 'QR কোড (Admin QR)', icon: QrCode },
    { id: 'admins', label: 'নিরাপত্তা ও অ্যাডমিন', icon: ShieldCheck },
  ];

  const publishedVideosCount = videos.filter((v) => v.published).length;
  const publishedServicesCount = services.filter((s) => s.published).length;
  const configuredContactsCount = Object.values(draft.contact).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#17251E] font-bn">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-[#064E3B] text-[#FAF8F3] border-b border-[#C9A254]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#C9A254]/50 bg-[#FAF8F3] shrink-0">
              <SmartImage
                src={draft.logoUrl}
                alt="কুরআনী শিফা"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold truncate">
                কুরআনী শিফা · QURANI SHIFA — অ্যাডমিন প্যানেল
              </div>
              <div className="text-xs text-[#C9A254] truncate" dir="ltr">
                {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F3]/10 hover:bg-[#FAF8F3]/20 text-xs font-medium text-[#FAF8F3] transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">পাবলিক ওয়েবসাইট দেখুন</span>
            </button>
            <button
              type="button"
              onClick={() => void signOut(auth)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A254] text-[#17251E] hover:bg-[#D5B26B] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>সাইন আউট</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 rounded-xl border border-[#064E3B]/15 bg-white p-2.5 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSaveSuccess('');
                    setSaveError('');
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left ${
                    active
                      ? 'bg-[#064E3B] text-[#FAF8F3]'
                      : 'text-[#2A3D34] hover:bg-[#FAF8F3] hover:text-[#064E3B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A254]' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Admin Workspace */}
          <main className="lg:col-span-9 space-y-6">
            {!dbInitialized && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-amber-950">
                  <strong>প্রাথমিক সেটআপ (Initial Setup):</strong> ডাটাবেসে এখনও মূল কনটেন্ট সংরক্ষিত হয়নি। নিচের বাটনে ক্লিক করে প্রাথমিক তথ্য সংরক্ষণ করুন।
                </div>
                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-xs font-semibold hover:bg-[#053D2E] shrink-0 cursor-pointer"
                >
                  ডাটাবেস সক্রিয় করুন (Initialize)
                </button>
              </div>
            )}

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs sm:text-sm text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-800">
                {saveError}
              </div>
            )}

            {/* A. Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6">
                  <h1 className="text-xl font-bold text-[#064E3B]">
                    স্বাগতম — কুরআনী শিফা (QURANI SHIFA) অ্যাডমিন ড্যাশবোর্ড
                  </h1>
                  <p className="mt-1 text-sm text-[#40544A]">
                    এখান থেকে ওয়েবসাইটের সকল লেখা, ছবি, ইউটিউব/ফেসবুক ভিডিও, যোগাযোগের লিংক, বাংলা-ইংরেজি-আরবি ভাষা এবং অফিসিয়াল QR কোড পরিচালনা করুন।
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-[#064E3B]/10 bg-[#FAF8F3] p-4">
                      <div className="text-xs font-medium text-[#52655B]">প্রকাশিত সেবা (Services)</div>
                      <div className="mt-1 text-2xl font-bold text-[#064E3B] tabular-nums">
                        {publishedServicesCount} / {services.length}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#064E3B]/10 bg-[#FAF8F3] p-4">
                      <div className="text-xs font-medium text-[#52655B]">প্রকাশিত ভিডিও (Videos)</div>
                      <div className="mt-1 text-2xl font-bold text-[#064E3B] tabular-nums">
                        {publishedVideosCount} / {videos.length}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#064E3B]/10 bg-[#FAF8F3] p-4">
                      <div className="text-xs font-medium text-[#52655B]">সক্রিয় যোগাযোগ মাধ্যম</div>
                      <div className="mt-1 text-2xl font-bold text-[#064E3B] tabular-nums">
                        {configuredContactsCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { tab: 'content' as AdminTab, title: 'ওয়েবসাইট কনটেন্ট ও সেকশন', desc: 'হিরো, পরিচিতি, মিশন ও সেকশন প্রকাশ নিয়ন্ত্রণ' },
                    { tab: 'videos' as AdminTab, title: 'ভিডিও গ্যালারি ম্যানেজমেন্ট', desc: 'ইউটিউব ও ফেসবুক ভিডিও লিংক যোগ ও সম্পাদনা' },
                    { tab: 'services' as AdminTab, title: 'সেবা ও তথ্য ম্যানেজমেন্ট', desc: 'সেবা যোগ, পরিবর্তন, ক্রম ও প্রকাশ নিয়ন্ত্রণ' },
                    { tab: 'contact' as AdminTab, title: 'যোগাযোগ ও সোশ্যাল লিংক', desc: 'হোয়াটসঅ্যাপ, ফেসবুক, ইমো, ফোন, ইমেইল ও ম্যাপস' },
                    { tab: 'images' as AdminTab, title: 'লোগো ও ছবি পরিবর্তন', desc: 'লোগো, ব্যানার ও সেকশন ছবি আপলোড ও প্রিভিউ' },
                    { tab: 'qr' as AdminTab, title: 'অফিসিয়াল QR কোড', desc: 'প্রকাশিত URL দিয়ে QR PNG ডাউনলোড ও প্রিন্ট' },
                  ].map((card) => (
                    <button
                      key={card.tab}
                      type="button"
                      onClick={() => setActiveTab(card.tab)}
                      className="rounded-xl border border-[#064E3B]/15 bg-white p-5 text-left hover:border-[#064E3B] transition-colors cursor-pointer"
                    >
                      <h2 className="text-sm font-bold text-[#064E3B]">{card.title}</h2>
                      <p className="mt-1.5 text-xs text-[#52655B] leading-relaxed">{card.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B. Website Content & Section Visibility */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6">
                  <h2 className="text-lg font-bold text-[#064E3B]">
                    সেকশন প্রকাশনা নিয়ন্ত্রণ (Section Visibility)
                  </h2>
                  <p className="mt-1 text-xs text-[#52655B]">
                    কোন কোন সেকশন পাবলিক ওয়েবসাইটে প্রদর্শিত হবে তা এখান থেকে চালু বা বন্ধ করুন।
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(
                      [
                        { key: 'showHero', label: 'Hero Section (হিরো)' },
                        { key: 'showAbout', label: 'About Section (পরিচিতি)' },
                        { key: 'showServices', label: 'Services Section (সেবা)' },
                        { key: 'showVideos', label: 'Video Gallery (ভিডিও)' },
                        { key: 'showContact', label: 'Contact Section (যোগাযোগ)' },
                      ] as const
                    ).map((sec) => (
                      <label
                        key={sec.key}
                        className="flex items-center gap-2.5 p-3 rounded-lg border border-[#064E3B]/12 bg-[#FAF8F3] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={draft.sectionsVisibility[sec.key]}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              sectionsVisibility: {
                                ...prev.sectionsVisibility,
                                [sec.key]: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 accent-[#064E3B]"
                        />
                        <span className="text-xs font-semibold text-[#17251E]">{sec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Bilingual Editor */}
                <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#064E3B]">
                        ওয়েবসাইট টেক্সট সম্পাদনা (Website Copy Editor)
                      </h2>
                      <p className="text-xs text-[#52655B]">
                        ভাষা নির্বাচন করে শিরোনাম, পরিচিতি, মিশন ও ফুটার টেক্সট পরিবর্তন করুন।
                      </p>
                    </div>
                    <div className="inline-flex p-1 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15">
                      {(
                        [
                          { code: 'bn', label: 'বাংলা' },
                          { code: 'en', label: 'English' },
                          { code: 'ar', label: 'العربية' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => setEditLang(opt.code)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                            editLang === opt.code
                              ? 'bg-[#064E3B] text-[#FAF8F3]'
                              : 'text-[#40544A]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div dir={editLang === 'ar' ? 'rtl' : 'ltr'} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Institution Name</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].institutionName}
                          onChange={(e) => updateLangField(editLang, 'institutionName', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Hero Kicker</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].heroKicker}
                          onChange={(e) => updateLangField(editLang, 'heroKicker', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Hero Headline</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].heroHeadline}
                          onChange={(e) => updateLangField(editLang, 'heroHeadline', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Hero CTA Button Text</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].heroCtaText}
                          onChange={(e) => updateLangField(editLang, 'heroCtaText', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Hero Description</label>
                      <textarea
                        rows={3}
                        value={draft.translations[editLang].heroDescription}
                        onChange={(e) => updateLangField(editLang, 'heroDescription', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#064E3B]/10">
                      <div>
                        <label className="block text-xs font-semibold mb-1">About Section Title</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].aboutTitle}
                          onChange={(e) => updateLangField(editLang, 'aboutTitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">About Subtitle</label>
                        <input
                          type="text"
                          value={draft.translations[editLang].aboutSubtitle}
                          onChange={(e) => updateLangField(editLang, 'aboutSubtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Institutional Introduction (About)</label>
                      <textarea
                        rows={4}
                        value={draft.translations[editLang].aboutDescription}
                        onChange={(e) => updateLangField(editLang, 'aboutDescription', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Mission & Objectives Heading</label>
                      <input
                        type="text"
                        value={draft.translations[editLang].aboutMissionTitle}
                        onChange={(e) => updateLangField(editLang, 'aboutMissionTitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Mission & Objectives Details</label>
                      <textarea
                        rows={3}
                        value={draft.translations[editLang].aboutMissionText}
                        onChange={(e) => updateLangField(editLang, 'aboutMissionText', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSaveSettings()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#C9A254]" />
                    <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ ও প্রকাশ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* C. Services Tab */}
            {activeTab === 'services' && <AdminServicesTab services={services} />}

            {/* D. Videos Tab */}
            {activeTab === 'videos' && <AdminVideosTab videos={videos} />}

            {/* E. Contact Management */}
            {activeTab === 'contact' && (
              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#064E3B]">
                    যোগাযোগ ও অফিসিয়াল সোশ্যাল মিডিয়া লিংক (Contact Management)
                  </h2>
                  <p className="mt-1 text-xs text-[#52655B]">
                    প্রতিষ্ঠানের প্রকৃত ফোন নম্বর, হোয়াটসঅ্যাপ, ইমো, ইমেইল, ফেসবুক, মেসেঞ্জার, ইউটিউব ও গুগল ম্যাপস লিংক যুক্ত করুন। খালি রাখলে ভুয়া তথ্য দেখানো হবে না।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir="ltr">
                  {(
                    [
                      { key: 'phone', label: 'Direct Phone Number (e.g. +8801XXXXXXXXX)', placeholder: '+880...' },
                      { key: 'whatsapp', label: 'WhatsApp Number or wa.me Link', placeholder: '+880... or https://wa.me/...' },
                      { key: 'imo', label: 'IMO Number', placeholder: '+880...' },
                      { key: 'email', label: 'Gmail / Official Email', placeholder: 'example@gmail.com' },
                      { key: 'facebookPageUrl', label: 'Facebook Official Page URL', placeholder: 'https://www.facebook.com/...' },
                      { key: 'messengerUrl', label: 'Facebook Messenger URL', placeholder: 'https://m.me/...' },
                      { key: 'youtubeChannelUrl', label: 'YouTube Channel URL', placeholder: 'https://www.youtube.com/@...' },
                      { key: 'googleMapsUrl', label: 'Google Maps Location Link', placeholder: 'https://maps.google.com/...' },
                    ] as const
                  ).map((item) => (
                    <div key={item.key}>
                      <label className="block text-xs font-semibold text-[#17251E] mb-1">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        value={draft.contact[item.key]}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, [item.key]: e.target.value },
                          }))
                        }
                        placeholder={item.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17251E] mb-1">
                    ঠিকানার সংক্ষিপ্ত বিবরণ (Address Label — Optional)
                  </label>
                  <input
                    type="text"
                    value={draft.contact.addressLabel}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, addressLabel: e.target.value },
                      }))
                    }
                    placeholder="যেমন: ঢাকা, বাংলাদেশ (সঠিক ঠিকানা লিখুন)"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#C9A254]" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'যোগাযোগের তথ্য সংরক্ষণ করুন'}</span>
                </button>
              </div>
            )}

            {/* F. Logo & Image Management */}
            {activeTab === 'images' && (
              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#064E3B]">
                    লোগো ও ওয়েবসাইটের ছবিসমূহ (Logo & Image Management)
                  </h2>
                  <p className="mt-1 text-xs text-[#52655B]">
                    লোগো, হিরো ব্যানার ও অন্যান্য ছবি আপলোড করুন অথবা URL দিন। প্রকাশের আগে নিচে সরাসরি প্রিভিউ দেখতে পারবেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      { key: 'logoUrl', title: 'প্রতিষ্ঠানের লোগো (Institution Logo)', aspect: 'aspect-square max-w-[160px]' },
                      { key: 'heroImageUrl', title: 'হিরো ব্যানার ছবি (Hero Banner)', aspect: 'aspect-video' },
                      { key: 'aboutImageUrl', title: 'পরিচিতি সেকশনের ছবি (About Image)', aspect: 'aspect-[4/3]' },
                      { key: 'servicesImageUrl', title: 'সেবা সেকশনের ছবি (Services Image)', aspect: 'aspect-[4/3]' },
                    ] as const
                  ).map((slot) => (
                    <div
                      key={slot.key}
                      className="rounded-xl border border-[#064E3B]/15 bg-[#FAF8F3] p-4 space-y-3"
                    >
                      <h3 className="text-sm font-bold text-[#064E3B]">{slot.title}</h3>
                      <div className={`w-full overflow-hidden rounded-lg border border-[#064E3B]/15 bg-white ${slot.aspect}`}>
                        <SmartImage
                          src={draft[slot.key]}
                          alt={slot.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-xs font-semibold hover:bg-[#053D2E] cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {uploadingField === slot.key ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              void handleImageFileUpload(slot.key, e.target.files?.[0])
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={draft[slot.key]}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [slot.key]: e.target.value }))
                        }
                        placeholder="Image URL..."
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving || Boolean(uploadingField)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#C9A254]" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ছবিগুলো প্রকাশ করুন (Publish Images)'}</span>
                </button>
              </div>
            )}

            {/* G. Full Multilingual Editor (BN / EN / AR with RTL) */}
            {activeTab === 'languages' && (
              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#064E3B]">
                      সকল ভাষার টেক্সট ব্যবস্থাপনা (Language Management — BN / EN / AR)
                    </h2>
                    <p className="text-xs text-[#52655B]">
                      বাংলা, ইংরেজি ও আরবি (RTL) ভাষার সকল সেকশনের শিরোনাম, বিবরণ ও কপিরাইট সম্পাদনা করুন।
                    </p>
                  </div>
                  <div className="inline-flex p-1 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15">
                    {(
                      [
                        { code: 'bn', label: 'বাংলা (BN)' },
                        { code: 'en', label: 'English (EN)' },
                        { code: 'ar', label: 'العربية (AR - RTL)' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => setEditLang(opt.code)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                          editLang === opt.code
                            ? 'bg-[#064E3B] text-[#FAF8F3]'
                            : 'text-[#40544A]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  dir={editLang === 'ar' ? 'rtl' : 'ltr'}
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                    editLang === 'ar' ? 'font-ar' : ''
                  }`}
                >
                  {(
                    [
                      { key: 'institutionName', label: 'Institution Name' },
                      { key: 'heroKicker', label: 'Hero Kicker' },
                      { key: 'heroHeadline', label: 'Hero Headline' },
                      { key: 'heroCtaText', label: 'Hero CTA Button' },
                      { key: 'aboutTitle', label: 'About Title' },
                      { key: 'aboutSubtitle', label: 'About Subtitle' },
                      { key: 'aboutMissionTitle', label: 'Mission Title' },
                      { key: 'servicesTitle', label: 'Services Title' },
                      { key: 'servicesSubtitle', label: 'Services Subtitle' },
                      { key: 'videoGalleryTitle', label: 'Video Gallery Title' },
                      { key: 'videoGallerySubtitle', label: 'Video Gallery Subtitle' },
                      { key: 'contactTitle', label: 'Contact Title' },
                      { key: 'contactSubtitle', label: 'Contact Subtitle' },
                      { key: 'copyrightText', label: 'Copyright Notice' },
                    ] as const
                  ).map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={draft.translations[editLang][field.key]}
                        onChange={(e) => updateLangField(editLang, field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div
                  dir={editLang === 'ar' ? 'rtl' : 'ltr'}
                  className={`space-y-4 ${editLang === 'ar' ? 'font-ar' : ''}`}
                >
                  <div>
                    <label className="block text-xs font-semibold mb-1">Hero Description</label>
                    <textarea
                      rows={3}
                      value={draft.translations[editLang].heroDescription}
                      onChange={(e) => updateLangField(editLang, 'heroDescription', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">About Description</label>
                    <textarea
                      rows={4}
                      value={draft.translations[editLang].aboutDescription}
                      onChange={(e) => updateLangField(editLang, 'aboutDescription', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Mission & Objectives Text</label>
                    <textarea
                      rows={3}
                      value={draft.translations[editLang].aboutMissionText}
                      onChange={(e) => updateLangField(editLang, 'aboutMissionText', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Footer Short Description</label>
                    <textarea
                      rows={2}
                      value={draft.translations[editLang].footerDescription}
                      onChange={(e) => updateLangField(editLang, 'footerDescription', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#C9A254]" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সকল ভাষার পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>
              </div>
            )}

            {/* H. Admin-Only QR Code Tab */}
            {activeTab === 'qr' && (
              <AdminQrTab
                settings={draft}
                onSavePublishedUrl={async (url) => {
                  const next = { ...draft, publishedUrl: url };
                  setDraft(next);
                  await saveSiteSettings(next);
                }}
              />
            )}

            {/* I. Authorized Admins Management */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#064E3B]">
                    অনুমোদিত অ্যাডমিন ব্যবস্থাপনা (Authorized Admins)
                  </h2>
                  <p className="text-xs text-[#52655B] leading-relaxed">
                    পাবলিক সাইন-আপ সম্পূর্ণ বন্ধ রাখা হয়েছে। শুধুমাত্র প্রাথমিক অ্যাডমিন ({BOOTSTRAPPED_ADMIN_EMAIL}) অথবা এখানে অনুমোদিত UID-ধারী গুগল অ্যাকাউন্টই অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন।
                  </p>

                  <div className="rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15 p-3.5 text-xs space-y-1">
                    <div>
                      <strong>বর্তমান অ্যাডমিন ইমেইল:</strong> {user.email}
                    </div>
                    <div className="break-all">
                      <strong>আপনার Firebase UID:</strong> {user.uid}
                    </div>
                  </div>

                  <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <input
                      type="text"
                      value={newAdminUid}
                      onChange={(e) => setNewAdminUid(e.target.value)}
                      placeholder="New Admin Firebase UID"
                      dir="ltr"
                      className="px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-xs"
                    />
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="New Admin Google Email"
                      dir="ltr"
                      className="px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-xs"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-xs font-semibold hover:bg-[#053D2E] cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>অ্যাডমিন অনুমোদন করুন</span>
                    </button>
                  </form>
                </div>

                <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6">
                  <h3 className="text-sm font-bold text-[#064E3B] mb-3">
                    অতিরিক্ত অনুমোদিত অ্যাডমিন তালিকা ({admins.length})
                  </h3>
                  {admins.length === 0 ? (
                    <p className="text-xs text-[#52655B]">
                      প্রাথমিক অ্যাডমিন ব্যতীত অতিরিক্ত কোনো অ্যাডমিন এখনও যুক্ত করা হয়নি।
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {admins.map((adm) => (
                        <div
                          key={adm.uid}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/10 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[#17251E]">{adm.email}</div>
                            <div className="text-[#52655B] break-all">{adm.uid}</div>
                          </div>
                          {adm.uid !== user.uid && (
                            <button
                              type="button"
                              onClick={() => void removeAuthorizedAdmin(adm.uid)}
                              className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
