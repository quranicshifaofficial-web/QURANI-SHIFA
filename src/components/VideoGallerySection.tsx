import { ExternalLink, Play, Video, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UI_LABELS } from '../data/defaultSiteData';
import { getVideoEmbedInfo } from '../lib/videoEmbed';
import { Language, VideoItem } from '../types/site';
import { SmartImage } from './SmartImage';

interface VideoGallerySectionProps {
  lang: Language;
  title: string;
  subtitle: string;
  videos: VideoItem[];
  loading: boolean;
}

export function VideoGallerySection({
  lang,
  title,
  subtitle,
  videos,
  loading,
}: VideoGallerySectionProps) {
  const labels = UI_LABELS[lang];
  const [filter, setFilter] = useState<'all' | 'youtube' | 'facebook'>('all');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (filter === 'all') return videos;
    return videos.filter((v) => v.platform === filter);
  }, [videos, filter]);

  const activeVideo = useMemo(
    () => videos.find((v) => v.id === activeVideoId) ?? null,
    [videos, activeVideoId]
  );

  const activeEmbed = useMemo(() => {
    if (!activeVideo) return null;
    return getVideoEmbedInfo(activeVideo.platform, activeVideo.videoUrl);
  }, [activeVideo]);

  return (
    <section
      id="videos"
      className="py-16 sm:py-24 border-t border-[#064E3B]/10 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading + Platform Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight text-balance">
              {title}
            </h2>
            <p className="mt-3 text-base text-[#40544A] leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter videos by platform"
            className="inline-flex items-center p-1 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15 self-start md:self-auto"
          >
            {(
              [
                { id: 'all', label: labels.allVideos },
                { id: 'youtube', label: labels.youtubeVideos },
                { id: 'facebook', label: labels.facebookVideos },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#064E3B] text-[#FAF8F3]'
                    : 'text-[#40544A] hover:text-[#064E3B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Embedded Player Viewport */}
        {activeVideo && activeEmbed && (
          <div
            className="mb-12 rounded-2xl border border-[#064E3B]/15 bg-[#FAF8F3] overflow-hidden"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#064E3B]/10 bg-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#64746B]">
                  <span>{activeVideo.platform === 'youtube' ? 'YouTube' : 'Facebook'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">
                    {activeVideo.title[lang] || activeVideo.title.en || activeVideo.title.bn}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeEmbed.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#064E3B]/20 text-[#064E3B] hover:bg-[#064E3B]/5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{labels.openOriginalVideo}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideoId(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-[#064E3B] text-[#FAF8F3] hover:bg-[#053D2E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{labels.closePlayer}</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#11221A]">
              {activeEmbed.canEmbed && activeEmbed.embedUrl ? (
                <div
                  className={`mx-auto overflow-hidden rounded-xl bg-black ${
                    activeEmbed.isPortrait ? 'max-w-sm aspect-[9/16]' : 'max-w-4xl aspect-video'
                  }`}
                >
                  <iframe
                    key={activeEmbed.embedUrl}
                    src={activeEmbed.embedUrl}
                    title={
                      activeVideo.title[lang] ||
                      activeVideo.title.en ||
                      activeVideo.title.bn ||
                      'Embedded Video'
                    }
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="max-w-2xl mx-auto py-12 px-6 text-center text-[#FAF8F3]">
                  <Video className="w-10 h-10 text-[#C9A254] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{labels.embedUnavailableTitle}</h3>
                  <p className="text-sm text-[#FAF8F3]/80 mb-5">{labels.embedUnavailableDesc}</p>
                  <a
                    href={activeEmbed.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A254] text-[#17251E] font-semibold text-sm hover:bg-[#D5B26B] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{labels.openOriginalVideo}</span>
                  </a>
                </div>
              )}

              {/* Graceful notice under embed for Facebook privacy/restrictions */}
              {activeVideo.platform === 'facebook' && activeEmbed.canEmbed && (
                <p className="mt-3 text-center text-xs text-[#FAF8F3]/75">
                  {labels.embedUnavailableDesc}{' '}
                  <a
                    href={activeEmbed.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#C9A254] hover:text-[#E2C27E]"
                  >
                    {labels.openOriginalVideo}
                  </a>
                </p>
              )}
            </div>

            {(activeVideo.description[lang] ||
              activeVideo.description.en ||
              activeVideo.description.bn) && (
              <div className="px-6 py-4 bg-white border-t border-[#064E3B]/10">
                <h3 className="text-lg font-semibold text-[#17251E]">
                  {activeVideo.title[lang] || activeVideo.title.en || activeVideo.title.bn}
                </h3>
                <p className="mt-1.5 text-sm text-[#40544A] leading-relaxed max-w-3xl">
                  {activeVideo.description[lang] ||
                    activeVideo.description.en ||
                    activeVideo.description.bn}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-[#064E3B]/10 bg-[#FAF8F3] overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-[#E7E2D6]" />
                <div className="p-5 space-y-2.5">
                  <div className="h-3 w-24 bg-[#E7E2D6] rounded" />
                  <div className="h-5 w-3/4 bg-[#E7E2D6] rounded" />
                  <div className="h-4 w-full bg-[#E7E2D6] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-2xl border border-[#064E3B]/15 bg-[#FAF8F3] p-10 text-center max-w-2xl mx-auto">
            <Video className="w-10 h-10 text-[#064E3B]/60 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-[#40544A] leading-relaxed">
              {labels.noVideosYet}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, idx) => {
              const embedInfo = getVideoEmbedInfo(video.platform, video.videoUrl);
              const thumbSrc = video.thumbnailUrl || embedInfo.fallbackThumbnail || '';
              const itemTitle =
                video.title[lang] || video.title.en || video.title.bn || video.title.ar;
              const itemDesc =
                video.description[lang] ||
                video.description.en ||
                video.description.bn ||
                video.description.ar;
              const isSelected = activeVideoId === video.id;

              return (
                <article
                  key={video.id}
                  className={`group rounded-xl border bg-[#FAF8F3] overflow-hidden flex flex-col transition-colors duration-150 ${
                    isSelected
                      ? 'border-[#064E3B] ring-1 ring-[#064E3B]'
                      : 'border-[#064E3B]/12 hover:border-[#B48A3E]'
                  }`}
                >
                  {/* Thumbnail Trigger */}
                  <button
                    type="button"
                    onClick={() => setActiveVideoId(video.id)}
                    className="relative aspect-video w-full overflow-hidden bg-[#0B3B2E] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C9A254]"
                    aria-label={`${labels.watchVideo}: ${itemTitle}`}
                  >
                    <SmartImage
                      src={thumbSrc}
                      alt={itemTitle}
                      fallbackTitle={itemTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-[#FAF8F3]/95 text-[#064E3B] flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-105">
                        <Play className="w-6 h-6 fill-current ms-0.5" />
                      </span>
                    </div>
                  </button>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#64746B] mb-2">
                        <span>{video.platform === 'youtube' ? 'YouTube' : 'Facebook'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#17251E] leading-snug">
                        {itemTitle}
                      </h3>
                      {itemDesc && (
                        <p className="mt-2 text-sm text-[#40544A] leading-relaxed line-clamp-2">
                          {itemDesc}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#064E3B]/10 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveVideoId(video.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#064E3B] hover:text-[#B48A3E] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-4 h-4" />
                        <span>{labels.watchVideo}</span>
                      </button>

                      {embedInfo.originalUrl && (
                        <a
                          href={embedInfo.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#52655B] hover:text-[#064E3B] transition-colors whitespace-nowrap"
                        >
                          <span>{labels.openOriginalVideo}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
