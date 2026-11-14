import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { uploadImageAsset } from '../../lib/firebase';
import {
  createServiceItem,
  deleteServiceItem,
  updateServiceItem,
} from '../../lib/siteService';
import { ServiceItem } from '../../types/site';
import { SmartImage } from '../SmartImage';

interface AdminServicesTabProps {
  services: ServiceItem[];
}

interface ServiceFormState {
  id: string | null;
  order: number;
  published: boolean;
  imageUrl: string;
  titleBn: string;
  titleEn: string;
  titleAr: string;
  descBn: string;
  descEn: string;
  descAr: string;
}

const EMPTY_FORM: ServiceFormState = {
  id: null,
  order: 1,
  published: true,
  imageUrl: '',
  titleBn: '',
  titleEn: '',
  titleAr: '',
  descBn: '',
  descEn: '',
  descAr: '',
};

export function AdminServicesTab({ services }: AdminServicesTabProps) {
  const [form, setForm] = useState<ServiceFormState>({
    ...EMPTY_FORM,
    order: services.length + 1,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEdit = (srv: ServiceItem) => {
    setForm({
      id: srv.id,
      order: srv.order,
      published: srv.published,
      imageUrl: srv.imageUrl || '',
      titleBn: srv.title.bn,
      titleEn: srv.title.en,
      titleAr: srv.title.ar,
      descBn: srv.description.bn,
      descEn: srv.description.en,
      descAr: srv.description.ar,
    });
    setFeedback('');
    setErrorMsg('');
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, order: services.length + 1 });
    setErrorMsg('');
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await uploadImageAsset(file, 'services');
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleBn.trim() && !form.titleEn.trim() && !form.titleAr.trim()) {
      setErrorMsg('অন্তত একটি ভাষায় সেবার শিরোনাম লিখুন। (Provide a title in at least one language.)');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    setFeedback('');

    const payload = {
      order: Number(form.order) || 1,
      published: form.published,
      imageUrl: form.imageUrl.trim(),
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
        await updateServiceItem(form.id, payload);
        setFeedback('সেবা সফলভাবে হালনাগাদ হয়েছে।');
      } else {
        await createServiceItem(payload);
        setFeedback('নতুন সেবা সফলভাবে যুক্ত হয়েছে।');
      }
      handleReset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (srv: ServiceItem) => {
    await updateServiceItem(srv.id, {
      order: srv.order,
      published: !srv.published,
      imageUrl: srv.imageUrl,
      title: srv.title,
      description: srv.description,
    });
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= services.length) return;
    const current = services[index];
    const swapWith = services[targetIdx];
    await Promise.all([
      updateServiceItem(current.id, {
        order: swapWith.order === current.order ? targetIdx + 1 : swapWith.order,
        published: current.published,
        imageUrl: current.imageUrl,
        title: current.title,
        description: current.description,
      }),
      updateServiceItem(swapWith.id, {
        order: current.order === swapWith.order ? index + 1 : current.order,
        published: swapWith.published,
        imageUrl: swapWith.imageUrl,
        title: swapWith.title,
        description: swapWith.description,
      }),
    ]);
  };

  const handleDelete = async (id: string) => {
    await deleteServiceItem(id);
    if (form.id === id) handleReset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-6 rounded-xl border border-[#064E3B]/15 bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#064E3B]">
            {form.id ? 'সেবা সম্পাদনা করুন (Edit Service)' : 'নতুন সেবা / তথ্য যোগ করুন'}
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
              ক্রম (Display Order)
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

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2.5 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-[#064E3B]"
              />
              <span className="text-sm font-medium text-[#17251E]">
                পাবলিক ওয়েবসাইটে প্রকাশ করুন (Published)
              </span>
            </label>
          </div>
        </div>

        {/* Multilingual Titles & Descriptions */}
        <div className="space-y-3 pt-2 border-t border-[#064E3B]/10">
          <div>
            <label className="block text-xs font-semibold text-[#17251E] mb-1">
              শিরোনাম — বাংলা (Title - Bengali)
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
              বিবরণ — বাংলা (Description - Bengali)
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
              Title — English
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
              Description — English
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
              العنوان — العربية (Title - Arabic)
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
              الوصف — العربية (Description - Arabic)
            </label>
            <textarea
              rows={2}
              value={form.descAr}
              onChange={(e) => setForm({ ...form, descAr: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm font-ar"
            />
          </div>
        </div>

        {/* Optional Image */}
        <div className="pt-2 border-t border-[#064E3B]/10 space-y-2">
          <label className="block text-xs font-semibold text-[#17251E]">
            ঐচ্ছিক ছবি (Optional Service Image)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#064E3B]/25 text-xs font-semibold text-[#064E3B] hover:bg-[#064E3B]/5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleImageUpload(e.target.files?.[0])}
              />
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="অথবা ছবির URL দিন..."
              dir="ltr"
              className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-xs"
            />
          </div>
          {form.imageUrl && (
            <div className="mt-2 w-40 aspect-[16/10] rounded-lg overflow-hidden border border-[#064E3B]/15">
              <SmartImage
                src={form.imageUrl}
                alt="Preview"
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
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : form.id ? 'আপডেট সংরক্ষণ করুন' : 'সেবা যুক্ত করুন'}</span>
        </button>
      </form>

      {/* Services List */}
      <div className="lg:col-span-6 space-y-3">
        <h3 className="text-base font-bold text-[#064E3B]">
          প্রকাশিত ও ড্রাফট সেবাসমূহ ({services.length})
        </h3>
        {services.length === 0 ? (
          <div className="rounded-xl border border-[#064E3B]/15 bg-white p-8 text-center text-sm text-[#52655B]">
            এখনও কোনো সেবা ডাটাবেসে যুক্ত হয়নি। বাম পাশের ফর্ম ব্যবহার করে যুক্ত করুন।
          </div>
        ) : (
          services.map((srv, idx) => (
            <div
              key={srv.id}
              className="rounded-xl border border-[#064E3B]/15 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#64746B] mb-1">
                  <span className="tabular-nums font-semibold">#{srv.order}</span>
                  <span aria-hidden="true">·</span>
                  <span className={srv.published ? 'text-[#064E3B] font-semibold' : 'text-amber-700 font-semibold'}>
                    {srv.published ? 'প্রকাশিত (Published)' : 'অপ্রকাশিত (Draft)'}
                  </span>
                </div>
                <h4 className="font-semibold text-[#17251E] truncate">
                  {srv.title.bn || srv.title.en || srv.title.ar}
                </h4>
                <p className="text-xs text-[#52655B] line-clamp-1 mt-0.5">
                  {srv.description.bn || srv.description.en || srv.description.ar}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleMoveOrder(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleMoveOrder(idx, 1)}
                  disabled={idx === services.length - 1}
                  title="Move down"
                  className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleTogglePublish(srv)}
                  title={srv.published ? 'Unpublish' : 'Publish'}
                  className="p-2 rounded-lg border border-[#064E3B]/15 text-[#40544A] hover:text-[#064E3B] cursor-pointer"
                >
                  {srv.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(srv)}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#064E3B]/15 text-xs font-semibold text-[#064E3B] hover:bg-[#064E3B]/10 cursor-pointer"
                >
                  সম্পাদনা
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(srv.id)}
                  title="Delete"
                  className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
