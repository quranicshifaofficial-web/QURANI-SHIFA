import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { DEFAULT_IMAGES, DEFAULT_SITE_SETTINGS } from '../data/defaultSiteData';
import { AdminRecord, LanguageCopy, ServiceItem, SiteSettings, VideoItem } from '../types/site';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'quranicshifa.official@gmail.com';

function resolveBundledDefaultUrl(rawUrl: string | undefined, fallback: string): string {
  if (!rawUrl) return fallback;
  if (rawUrl.includes('institution_emblem_logo_')) return DEFAULT_IMAGES.logo;
  if (rawUrl.includes('hero_islamic_sanctuary_')) return DEFAULT_IMAGES.hero;
  if (rawUrl.includes('about_study_manuscript_')) return DEFAULT_IMAGES.about;
  if (rawUrl.includes('service_courtyard_arch_')) return DEFAULT_IMAGES.services;
  return rawUrl;
}

function sanitizeString(value: unknown, maxLen: number): string {
  const str = typeof value === 'string' ? value : '';
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function sanitizeLangCopy(raw: Partial<LanguageCopy> | undefined, fallback: LanguageCopy): LanguageCopy {
  return {
    institutionName: sanitizeString(raw?.institutionName ?? fallback.institutionName, 200),
    heroKicker: sanitizeString(raw?.heroKicker ?? fallback.heroKicker, 200),
    heroHeadline: sanitizeString(raw?.heroHeadline ?? fallback.heroHeadline, 300),
    heroDescription: sanitizeString(raw?.heroDescription ?? fallback.heroDescription, 2000),
    heroCtaText: sanitizeString(raw?.heroCtaText ?? fallback.heroCtaText, 120),
    aboutTitle: sanitizeString(raw?.aboutTitle ?? fallback.aboutTitle, 200),
    aboutSubtitle: sanitizeString(raw?.aboutSubtitle ?? fallback.aboutSubtitle, 300),
    aboutDescription: sanitizeString(raw?.aboutDescription ?? fallback.aboutDescription, 5000),
    aboutMissionTitle: sanitizeString(raw?.aboutMissionTitle ?? fallback.aboutMissionTitle, 200),
    aboutMissionText: sanitizeString(raw?.aboutMissionText ?? fallback.aboutMissionText, 4000),
    servicesTitle: sanitizeString(raw?.servicesTitle ?? fallback.servicesTitle, 200),
    servicesSubtitle: sanitizeString(raw?.servicesSubtitle ?? fallback.servicesSubtitle, 500),
    videoGalleryTitle: sanitizeString(raw?.videoGalleryTitle ?? fallback.videoGalleryTitle, 200),
    videoGallerySubtitle: sanitizeString(raw?.videoGallerySubtitle ?? fallback.videoGallerySubtitle, 500),
    contactTitle: sanitizeString(raw?.contactTitle ?? fallback.contactTitle, 200),
    contactSubtitle: sanitizeString(raw?.contactSubtitle ?? fallback.contactSubtitle, 500),
    footerDescription: sanitizeString(raw?.footerDescription ?? fallback.footerDescription, 1000),
    copyrightText: sanitizeString(raw?.copyrightText ?? fallback.copyrightText, 300),
  };
}

export function mergeSiteSettings(raw: Partial<SiteSettings> | undefined): SiteSettings {
  return {
    logoUrl: sanitizeString(resolveBundledDefaultUrl(raw?.logoUrl, DEFAULT_SITE_SETTINGS.logoUrl), 300000),
    heroImageUrl: sanitizeString(resolveBundledDefaultUrl(raw?.heroImageUrl, DEFAULT_SITE_SETTINGS.heroImageUrl), 300000),
    aboutImageUrl: sanitizeString(resolveBundledDefaultUrl(raw?.aboutImageUrl, DEFAULT_SITE_SETTINGS.aboutImageUrl), 300000),
    servicesImageUrl: sanitizeString(resolveBundledDefaultUrl(raw?.servicesImageUrl, DEFAULT_SITE_SETTINGS.servicesImageUrl), 300000),
    publishedUrl: sanitizeString(raw?.publishedUrl ?? DEFAULT_SITE_SETTINGS.publishedUrl, 512),
    sectionsVisibility: {
      showHero: raw?.sectionsVisibility?.showHero ?? DEFAULT_SITE_SETTINGS.sectionsVisibility.showHero,
      showAbout: raw?.sectionsVisibility?.showAbout ?? DEFAULT_SITE_SETTINGS.sectionsVisibility.showAbout,
      showServices: raw?.sectionsVisibility?.showServices ?? DEFAULT_SITE_SETTINGS.sectionsVisibility.showServices,
      showVideos: raw?.sectionsVisibility?.showVideos ?? DEFAULT_SITE_SETTINGS.sectionsVisibility.showVideos,
      showContact: raw?.sectionsVisibility?.showContact ?? DEFAULT_SITE_SETTINGS.sectionsVisibility.showContact,
    },
    translations: {
      bn: sanitizeLangCopy(raw?.translations?.bn, DEFAULT_SITE_SETTINGS.translations.bn),
      en: sanitizeLangCopy(raw?.translations?.en, DEFAULT_SITE_SETTINGS.translations.en),
      ar: sanitizeLangCopy(raw?.translations?.ar, DEFAULT_SITE_SETTINGS.translations.ar),
    },
    contact: {
      phone: sanitizeString(raw?.contact?.phone ?? '', 100),
      whatsapp: sanitizeString(raw?.contact?.whatsapp ?? '', 100),
      imo: sanitizeString(raw?.contact?.imo ?? '', 100),
      email: sanitizeString(raw?.contact?.email ?? '', 200),
      facebookPageUrl: sanitizeString(raw?.contact?.facebookPageUrl ?? '', 512),
      messengerUrl: sanitizeString(raw?.contact?.messengerUrl ?? '', 512),
      youtubeChannelUrl: sanitizeString(raw?.contact?.youtubeChannelUrl ?? '', 512),
      googleMapsUrl: sanitizeString(raw?.contact?.googleMapsUrl ?? '', 1024),
      addressLabel: sanitizeString(raw?.contact?.addressLabel ?? '', 400),
    },
  };
}

export function subscribePublicSiteSettings(
  onData: (settings: SiteSettings, existsInDb: boolean) => void,
  onError?: (err: Error) => void
) {
  const path = 'site_settings/main';
  return onSnapshot(
    doc(db, 'site_settings', 'main'),
    (snap) => {
      if (snap.exists()) {
        onData(mergeSiteSettings(snap.data() as Partial<SiteSettings>), true);
      } else {
        onData(DEFAULT_SITE_SETTINGS, false);
      }
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Error logged by handleFirestoreError
      }
    }
  );
}

export function subscribePublishedServices(
  onData: (items: ServiceItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'services';
  const q = query(collection(db, 'services'), where('published', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ServiceItem[] = snapshot.docs
        .map((d) => ({ ...(d.data() as Omit<ServiceItem, 'id'>), id: d.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export function subscribePublishedVideos(
  onData: (items: VideoItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'videos';
  const q = query(collection(db, 'videos'), where('published', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: VideoItem[] = snapshot.docs
        .map((d) => ({ ...(d.data() as Omit<VideoItem, 'id'>), id: d.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export function subscribeAllServicesAdmin(
  onData: (items: ServiceItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'services';
  return onSnapshot(
    collection(db, 'services'),
    (snapshot) => {
      const items: ServiceItem[] = snapshot.docs
        .map((d) => ({ ...(d.data() as Omit<ServiceItem, 'id'>), id: d.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export function subscribeAllVideosAdmin(
  onData: (items: VideoItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'videos';
  return onSnapshot(
    collection(db, 'videos'),
    (snapshot) => {
      const items: VideoItem[] = snapshot.docs
        .map((d) => ({ ...(d.data() as Omit<VideoItem, 'id'>), id: d.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required to save settings.');

  const clean = mergeSiteSettings(settings);
  const path = 'site_settings/main';
  try {
    await setDoc(doc(db, 'site_settings', 'main'), {
      ...clean,
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function makeDocId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createServiceItem(
  item: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  const id = makeDocId('srv');
  const path = `services/${id}`;
  try {
    await setDoc(doc(db, 'services', id), {
      order: Math.max(0, Math.min(10000, Math.round(Number(item.order) || 0))),
      published: Boolean(item.published),
      imageUrl: sanitizeString(item.imageUrl, 300000),
      title: {
        bn: sanitizeString(item.title.bn, 300),
        en: sanitizeString(item.title.en, 300),
        ar: sanitizeString(item.title.ar, 300),
      },
      description: {
        bn: sanitizeString(item.description.bn, 3000),
        en: sanitizeString(item.description.en, 3000),
        ar: sanitizeString(item.description.ar, 3000),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateServiceItem(
  id: string,
  item: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  const path = `services/${id}`;
  try {
    await updateDoc(doc(db, 'services', id), {
      order: Math.max(0, Math.min(10000, Math.round(Number(item.order) || 0))),
      published: Boolean(item.published),
      imageUrl: sanitizeString(item.imageUrl, 300000),
      title: {
        bn: sanitizeString(item.title.bn, 300),
        en: sanitizeString(item.title.en, 300),
        ar: sanitizeString(item.title.ar, 300),
      },
      description: {
        bn: sanitizeString(item.description.bn, 3000),
        en: sanitizeString(item.description.en, 3000),
        ar: sanitizeString(item.description.ar, 3000),
      },
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteServiceItem(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createVideoItem(
  item: Omit<VideoItem, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  const id = makeDocId('vid');
  const path = `videos/${id}`;
  try {
    await setDoc(doc(db, 'videos', id), {
      platform: item.platform === 'facebook' ? 'facebook' : 'youtube',
      videoUrl: sanitizeString(item.videoUrl, 1024),
      thumbnailUrl: sanitizeString(item.thumbnailUrl, 300000),
      order: Math.max(0, Math.min(10000, Math.round(Number(item.order) || 0))),
      published: Boolean(item.published),
      title: {
        bn: sanitizeString(item.title.bn, 300),
        en: sanitizeString(item.title.en, 300),
        ar: sanitizeString(item.title.ar, 300),
      },
      description: {
        bn: sanitizeString(item.description.bn, 2000),
        en: sanitizeString(item.description.en, 2000),
        ar: sanitizeString(item.description.ar, 2000),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateVideoItem(
  id: string,
  item: Omit<VideoItem, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  const path = `videos/${id}`;
  try {
    await updateDoc(doc(db, 'videos', id), {
      platform: item.platform === 'facebook' ? 'facebook' : 'youtube',
      videoUrl: sanitizeString(item.videoUrl, 1024),
      thumbnailUrl: sanitizeString(item.thumbnailUrl, 300000),
      order: Math.max(0, Math.min(10000, Math.round(Number(item.order) || 0))),
      published: Boolean(item.published),
      title: {
        bn: sanitizeString(item.title.bn, 300),
        en: sanitizeString(item.title.en, 300),
        ar: sanitizeString(item.title.ar, 300),
      },
      description: {
        bn: sanitizeString(item.description.bn, 2000),
        en: sanitizeString(item.description.en, 2000),
        ar: sanitizeString(item.description.ar, 2000),
      },
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVideoItem(id: string): Promise<void> {
  const path = `videos/${id}`;
  try {
    await deleteDoc(doc(db, 'videos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function verifyUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  const path = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeAdminRecords(
  onData: (admins: AdminRecord[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'admins';
  return onSnapshot(
    collection(db, 'admins'),
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as AdminRecord);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function addAuthorizedAdmin(uid: string, email: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required.');
  const cleanUid = uid.trim();
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(cleanUid)) {
    throw new Error('Invalid Firebase UID format.');
  }
  const cleanEmail = sanitizeString(email.trim(), 256);
  if (cleanEmail.length < 3) {
    throw new Error('Please enter a valid admin email address.');
  }
  const path = `admins/${cleanUid}`;
  try {
    await setDoc(doc(db, 'admins', cleanUid), {
      uid: cleanUid,
      email: cleanEmail,
      addedBy: currentUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeAuthorizedAdmin(uid: string): Promise<void> {
  const path = `admins/${uid}`;
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
