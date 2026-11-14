import { VideoPlatform } from '../types/site';

export interface VideoEmbedInfo {
  canEmbed: boolean;
  embedUrl: string | null;
  originalUrl: string;
  isPortrait: boolean;
  fallbackThumbnail: string | null;
  reason?: string;
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{6,20}$/.test(vParam)) {
        return vParam;
      }
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(parts[0])) {
        const id = parts[1];
        return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function isYouTubeShorts(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl.trim().startsWith('http') ? rawUrl.trim() : `https://${rawUrl.trim()}`);
    return url.pathname.toLowerCase().includes('/shorts/');
  } catch {
    return false;
  }
}

export function normalizeExternalUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getVideoEmbedInfo(platform: VideoPlatform, rawUrl: string): VideoEmbedInfo {
  const originalUrl = normalizeExternalUrl(rawUrl);

  if (!originalUrl) {
    return {
      canEmbed: false,
      embedUrl: null,
      originalUrl: '',
      isPortrait: false,
      fallbackThumbnail: null,
      reason: 'Empty video URL',
    };
  }

  if (platform === 'youtube') {
    const id = extractYouTubeVideoId(originalUrl);
    if (!id) {
      return {
        canEmbed: false,
        embedUrl: null,
        originalUrl,
        isPortrait: false,
        fallbackThumbnail: null,
        reason: 'Could not extract a valid YouTube video ID from this URL.',
      };
    }
    return {
      canEmbed: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
      originalUrl,
      isPortrait: isYouTubeShorts(originalUrl),
      fallbackThumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Facebook video handling
  try {
    const parsed = new URL(originalUrl);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const pathLower = parsed.pathname.toLowerCase();

    if (host === 'fb.watch' || pathLower.includes('/share/')) {
      return {
        canEmbed: false,
        embedUrl: null,
        originalUrl,
        isPortrait: false,
        fallbackThumbnail: null,
        reason:
          'Facebook short or share links (fb.watch / /share/) often restrict iframe embedding. Open the original video directly.',
      };
    }

    if (host.endsWith('facebook.com')) {
      if (pathLower.includes('/plugins/video.php')) {
        return {
          canEmbed: true,
          embedUrl: originalUrl,
          originalUrl,
          isPortrait: false,
          fallbackThumbnail: null,
        };
      }

      const isReel = pathLower.includes('/reel/');
      const hasVideoPattern =
        pathLower.includes('/videos/') ||
        pathLower.includes('/watch') ||
        isReel ||
        parsed.searchParams.has('v');

      if (!hasVideoPattern) {
        return {
          canEmbed: false,
          embedUrl: null,
          originalUrl,
          isPortrait: false,
          fallbackThumbnail: null,
          reason: 'This Facebook URL does not match a direct embeddable video or reel link.',
        };
      }

      return {
        canEmbed: true,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          originalUrl
        )}&show_text=false&t=0`,
        originalUrl,
        isPortrait: isReel,
        fallbackThumbnail: null,
      };
    }

    return {
      canEmbed: false,
      embedUrl: null,
      originalUrl,
      isPortrait: false,
      fallbackThumbnail: null,
      reason: 'Unrecognized Facebook video URL.',
    };
  } catch {
    return {
      canEmbed: false,
      embedUrl: null,
      originalUrl,
      isPortrait: false,
      fallbackThumbnail: null,
      reason: 'Invalid URL format.',
    };
  }
}
