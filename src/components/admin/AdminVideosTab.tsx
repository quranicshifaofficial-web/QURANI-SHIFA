import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { uploadImageAsset } from '../../lib/firebase';
import {
  createVideoItem,
  deleteVideoItem,
  updateVideoItem,
} from '../../lib/siteService';
import { getVideoEmbedInfo } from '../../lib/videoEmbed';
import { VideoItem, VideoPlatform } from '../../types/site';
import { SmartImage } from '../SmartImage';

interface AdminVideosTabProps {
  videos: VideoItem[];
}

interface VideoFormState {
  id: string | null;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnailUrl: string;
  order: number;
  published: boolean;
  titleBn: string;
  titleEn: string;
  titleAr: string;
  descBn: string;
  descEn: string;
  descAr: string;
}

const EMPTY_VIDEO: VideoFormState = {
  id: null,
  platform: 'youtube',
  videoUrl: '',
  thumbnailUrl: '',
  order: 1,
  published: true,
  titleBn: '',
  titleEn: '',
  titleAr: '',
  descBn: '',
  descEn: '',
  descAr: '',
};

export function AdminVideosTab({ videos }: AdminVideosTabProps) {
  const [form, setForm] = useState<VideoFormState>({
    ...EMPTY_VIDEO,
    order: videos.length + 1,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const embedPreview = useMemo(
    () => getVideoEmbedInfo(form.platform, form.videoUrl),
    [form.platform, form.videoUrl]
  );

  const handleEdit = (v: VideoItem) => {
    setForm({
      id: v.id,
      platform: v.platform,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl || '',
      order: v.order,
      published: v.published,
      titleBn: v.title.bn,
      titleEn: v.title.en,
      titleAr: v.title.ar,
      descBn: v.description.bn,
      descEn: v.description.en,
      descAr: v.description.ar,
    });
    setFeedback('');
    setErrorMsg('');
  };

  const handleReset = () => {
    setForm({ ...EMPTY_VIDEO, order: videos.length + 1 });
    setErrorMsg('');
  };

  const handleThumbUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await uploadImageAsset(file, 'video-thumbs');
      setForm((prev) => ({ ...prev, thumbnailUrl: res.url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Thumbnail upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoUrl.trim()) {
      setErrorMsg('অনুগ্রহ করে ভিডিওর URL দিন। (Please provide the YouTube or Facebook video URL.)');
      return;
    }
    if (!form.titleBn.trim() && !form.titleEn.trim() && !form.titleAr.trim()) {
      setErrorMsg('অন্তত একটি ভাষায় ভিডিওর শিরোনাম লিখুন।');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setFeedback('');

    const payload = {
      platform: form.platform,
      videoUrl: form.videoUrl.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      order: Number(form.order) || 1,
      published: form.published,
      title: {
        bn: form.titleBn.trim(),
        en: form.titleEn.trim(),
        ar: form.titleAr.trim(),
      },
      description: {
        bn: form.descBn.trim(),
        en: form.descEn.trim(),
        ar: form.descAr.trim(),
      },
    };

    try {
      if (form.id) {
        await updateVideoItem(form.id, payload);
        setFeedback('ভিডিও সফলভাবে হালনাগাদ হয়েছে।');
      } else {
        await createVideoItem(payload);
        setFeedback('নতুন ভিডিও গ্যালারিতে যুক্ত হয়েছে।');
      }
      handleReset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save video.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (v: VideoItem) => {
    await updateVideoItem(v.id, {
      platform: v.platform,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      order: v.order,
      published: !v.published,
      title: v.title,
      description: v.description,
    });
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= videos.length) return;
    const current = videos[index];
    const swapWith = videos[targetIdx];
    await Promise.all([
      updateVideoItem(current.id, {
        platform: current.platform,
        videoUrl: current.videoUrl,
        thumbnailUrl: current.thumbnailUrl,
        order: swapWith.order === current.order ? targetIdx + 1 : swapWith.order,
        published: current.published,
        title: current.title,
        description: current.description,
      }),
      updateVideoItem(swapWith.id, {
        platform: swapWith.platform,
        videoUrl: swapWith.videoUrl,
        thumbnailUrl: swapWith.thumbnailUrl,
        order: current.order === swapWith.order ? index + 1 : current.order,
        published: swapWith.published,
        title: swapWith.title,
        description: swapWith.description,
      }),
    ]);
  };

  const handleDelete = async (id: string) => {
    await deleteVideoItem(id);
    if (form.id === id) handleReset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-6 rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#064E3B]">
            {form.id ? 'ভিডিও সম্পাদনা করুন (Edit Video)' : 'নতুন ইউটিউব / ফেসবুক ভিডিও যোগ করুন'}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-[#52655B] hover:text-[#064E3B] cursor-pointer"
            >
              বাতিল করুন
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              ভিডিও প্ল্যাটফর্ম (Platform)
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value as VideoPlatform })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            >
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              প্রদর্শন ক্রম (Order)
            </label>
            <input
              type="number"
              min={0}
              max={10000}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17251E] mb-1">
            ভিডিও লিংক (YouTube or Facebook Video URL)
          </label>
          <input
            type="url"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder={
              form.platform === 'youtube'
                ? 'https://www.youtube.com/watch?v=...'
                : 'https://www.facebook.com/page/videos/...'
            }
            dir="ltr"
            className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
          />
          {form.videoUrl.trim() && !embedPreview.canEmbed && (
            <p className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
              {embedPreview.reason} (ভিজিটররা তবুও &ldquo;Open Original Video&rdquo; বাটনের মাধ্যমে মূল ভিডিও দেখতে পারবেন।)
            </p>
          )}
        </div>

        {embedPreview.canEmbed && embedPreview.embedUrl && (
          <div className="rounded-lg overflow-hidden border border-[#064E3B]/15 bg-black aspect-video">
            <iframe
              src={embedPreview.embedUrl}
              title="Video Embed Preview"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        )}

        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 accent-[#064E3B]"
          />
          <span className="text-sm font-medium text-[#17251E]">
            গ্যালারিতে প্রকাশ করুন (Published)
          </span>
        </label>

        {/* Localized Titles & Descriptions */}
        <div className="space-y-3 pt-2 border-t border-[#064E3B]/10">
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              ভিডিও শিরোনাম — বাংলা
            </label>
            <input
              type="text"
              value={form.titleBn}
              onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              ভিডিও বিবরণ — বাংলা
            </label>
            <textarea
              rows={2}
              value={form.descBn}
              onChange={(e) => setForm({ ...form, descBn: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              Video Title — English
            </label>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              Video Description — English
            </label>
            <textarea
              rows={2}
              value={form.descEn}
              onChange={(e) => setForm({ ...form, descEn: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm"
            />
          </div>
          <div dir="rtl">
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              عنوان الفيديو — العربية
            </label>
            <input
              type="text"
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm font-ar"
            />
          </div>
          <div dir="rtl">
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              وصف الفيديو — العربية
            </label>
            <textarea
              rows={2}
              value={form.descAr}
              onChange={(e) => setForm({ ...form, descAr: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm font-ar"
            />
          </div>
        </div>

        {/* Thumbnail Upload / URL */}
        <div className="pt-2 border-t border-[#064E3B]/10 space-y-2">
          <label className="block text-xs font-semibold text-[#17251E]">
            কাস্টম থাম্বনেইল (Custom Thumbnail — Optional)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#064E3B]/25 text-xs font-semibold text-[#064E3B] hover:bg-[#064E3B]/5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'আপলোড হচ্ছে...' : 'থাম্বনেইল আপলোড'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleThumbUpload(e.target.files?.[0])}
              />
            </label>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              placeholder="অথবা থাম্বনেইল URL..."
              dir="ltr"
              className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-xs"
            />
          </div>
          {(form.thumbnailUrl || embedPreview.fallbackThumbnail) && (
            <div className="mt-2 w-44 aspect-video rounded-lg overflow-hidden border border-[#064E3B]/15">
              <SmartImage
                src={form.thumbnailUrl || embedPreview.fallbackThumbnail || ''}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
            {errorMsg}
          </div>
        )}
        {feedback && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
            {feedback}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {form.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : form.id ? 'ভিডিও আপডেট করুন' : 'ভিডিও যুক্ত করুন'}</span>
        </button>
      </form>

      {/* Video Records List */}
      <div className="lg:col-span-6 space-y-3">
        <h3 className="text-base font-bold text-[#064E3B]">
          সংরক্ষিত ভিডিওসমূহ ({videos.length})
        </h3>
        {videos.length === 0 ? (
          <div className="rounded-xl border border-[#064E3B]/15 bg-white p-8 text-center text-sm text-[#52655B]">
            এখনও কোনো ভিডিও যোগ করা হয়নি। বাম পাশের ফর্ম দিয়ে ইউটিউব বা ফেসবুক ভিডিও যোগ করুন।
          </div>
        ) : (
          videos.map((v, idx) => {
            const info = getVideoEmbedInfo(v.platform, v.videoUrl);
            const thumb = v.thumbnailUrl || info.fallbackThumbnail || '';
            return (
              <div
                key={v.id}
                className="rounded-xl border border-[#064E3B]/15 bg-white p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-24 aspect-video rounded-md overflow-hidden bg-[#064E3B] shrink-0">
                    <SmartImage
                      src={thumb}
                      alt={v.title.bn || v.title.en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#64746B] mb-0.5">
                      <span className="font-semibold uppercase">{v.platform}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">#{v.order}</span>
                      <span aria-hidden="true">·</span>
                      <span className={v.published ? 'text-[#064E3B] font-semibold' : 'text-amber-700 font-semibold'}>
                        {v.published ? 'প্রকাশিত' : 'ড্রাফট'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#17251E] text-sm truncate">
                      {v.title.bn || v.title.en || v.title.ar}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleMoveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMoveOrder(idx, 1)}
                    disabled={idx === videos.length - 1}
                    className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleTogglePublish(v)}
                    className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] cursor-pointer"
                  >
                    {v.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(v)}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15 text-xs font-semibold text-[#064E3B] hover:bg-[#064E3B]/10 cursor-pointer"
                  >
                    সম্পাদনা
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(v.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
