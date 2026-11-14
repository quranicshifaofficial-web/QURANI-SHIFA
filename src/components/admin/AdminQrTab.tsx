import { AlertTriangle, Download, Printer, QrCode, RefreshCw, Save } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import { SiteSettings } from '../../types/site';
import { SmartImage } from '../SmartImage';

interface AdminQrTabProps {
  settings: SiteSettings;
  onSavePublishedUrl: (url: string) => Promise<void>;
}

function isTemporaryPreviewUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('ais-dev-') ||
      host.endsWith('.local')
    );
  } catch {
    return false;
  }
}

export function AdminQrTab({ settings, onSavePublishedUrl }: AdminQrTabProps) {
  const [urlInput, setUrlInput] = useState(settings.publishedUrl || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [regenCounter, setRegenCounter] = useState(0);

  useEffect(() => {
    if (settings.publishedUrl && !urlInput) {
      setUrlInput(settings.publishedUrl);
    }
  }, [settings.publishedUrl, urlInput]);

  const trimmedUrl = urlInput.trim();

  const urlValidation = useMemo(() => {
    if (!trimmedUrl) {
      return { valid: false, isTemp: false, reason: 'Enter your permanent published website URL (e.g., https://quranishifa.org).' };
    }
    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { valid: false, isTemp: false, reason: 'URL must start with https:// or http://' };
      }
      if (isTemporaryPreviewUrl(trimmedUrl)) {
        return {
          valid: false,
          isTemp: true,
          reason:
            'Temporary preview URLs (localhost / ais-dev-*) cannot be used for permanent QR codes. Please enter your live published website URL.',
        };
      }
      return { valid: true, isTemp: false, reason: '' };
    } catch {
      return { valid: false, isTemp: false, reason: 'Please enter a valid full URL including https://' };
    }
  }, [trimmedUrl]);

  useEffect(() => {
    let active = true;
    async function generate() {
      if (!urlValidation.valid) {
        setQrDataUrl('');
        return;
      }
      try {
        const dataUrl = await QRCode.toDataURL(trimmedUrl, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#064E3B',
            light: '#FFFFFF',
          },
        });
        if (active) {
          setQrDataUrl(dataUrl);
          setErrorMsg('');
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to generate QR code.');
          setQrDataUrl('');
        }
      }
    }
    void generate();
    return () => {
      active = false;
    };
  }, [trimmedUrl, urlValidation.valid, regenCounter]);

  const handleSaveUrlAndRegenerate = async () => {
    if (!urlValidation.valid) return;
    setSaving(true);
    setSavedNotice('');
    setErrorMsg('');
    try {
      await onSavePublishedUrl(trimmedUrl);
      setRegenCounter((c) => c + 1);
      setSavedNotice('Published URL saved and QR code updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White & Ivory Institutional Card Background
    ctx.fillStyle = '#FAF8F3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Emerald Outer Border
    ctx.strokeStyle = '#064E3B';
    ctx.lineWidth = 18;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Gold Inner Accent Border
    ctx.strokeStyle = '#B48A3E';
    ctx.lineWidth = 4;
    ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

    // Title Header
    ctx.fillStyle = '#064E3B';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('কুরআনী শিফা · QURANI SHIFA', canvas.width / 2, 160);

    ctx.fillStyle = '#52655B';
    ctx.font = '32px sans-serif';
    ctx.fillText('قرآني شفاء — Official Website', canvas.width / 2, 215);

    // QR Code Image
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 860;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 270;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 48);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#17251E';
      ctx.font = '600 28px sans-serif';
      ctx.fillText(trimmedUrl, canvas.width / 2, 1255);

      ctx.fillStyle = '#64746B';
      ctx.font = '24px sans-serif';
      ctx.fillText('Scan with your phone camera to visit the official website', canvas.width / 2, 1315);

      const link = document.createElement('a');
      link.download = 'qurani-shifa-official-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6">
        <h2 className="text-xl font-bold text-[#064E3B]">
          QR কোড ম্যানেজমেন্ট (Admin-Only QR Code)
        </h2>
        <p className="mt-1 text-sm text-[#40544A]">
          এই QR কোডটি শুধুমাত্র অ্যাডমিন প্যানেলের জন্য—পাবলিক হোমপেজে এটি প্রদর্শিত হয় না। আপনার আসল প্রকাশিত (Published) ওয়েবসাইট URL দিয়ে উচ্চ-মানের PNG ডাউনলোড বা প্রিন্ট করুন।
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#17251E]">
            প্রকাশিত ওয়েবসাইটের URL (Published Website URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-published-domain.com"
              dir="ltr"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#064E3B]/20 bg-[#FAF8F3] text-sm text-[#17251E] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
            <button
              type="button"
              onClick={handleSaveUrlAndRegenerate}
              disabled={!urlValidation.valid || saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'URL সংরক্ষণ ও QR তৈরি করুন'}</span>
            </button>
          </div>

          {!urlValidation.valid && (
            <div
              className={`rounded-lg border p-3.5 text-xs flex items-start gap-2.5 ${
                urlValidation.isTemp
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'border-[#064E3B]/15 bg-[#FAF8F3] text-[#40544A]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{urlValidation.reason}</span>
            </div>
          )}

          {savedNotice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              {savedNotice}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Printable & Downloadable QR Preview Card */}
      <div className="rounded-xl border border-[#064E3B]/15 bg-white p-6">
        {qrDataUrl ? (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div
              id="qr-print-sheet"
              className="w-full max-w-sm rounded-2xl border-2 border-[#064E3B] bg-[#FAF8F3] p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#B48A3E]/40">
                  <SmartImage
                    src={settings.logoUrl}
                    alt="কুরআনী শিফা"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#064E3B]">কুরআনী শিফা</div>
                  <div className="text-xs font-semibold text-[#52655B]">QURANI SHIFA</div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#064E3B]/10 inline-block">
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${trimmedUrl}`}
                  className="w-60 h-60 object-contain"
                />
              </div>
              <p className="mt-3 text-xs font-medium text-[#17251E] break-all" dir="ltr">
                {trimmedUrl}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-[#17251E]">
                উচ্চ-মানের QR কোড প্রস্তুত (Ready to Download & Print)
              </h3>
              <p className="text-sm text-[#40544A] leading-relaxed">
                ভবিষ্যতে ওয়েবসাইটের ডোমেইন বা URL পরিবর্তন হলে উপরের ঘরে নতুন URL লিখে পুনরায় জেনারেট করুন। ডাউনলোড করা PNG ফাইলটি ব্যানার, কার্ড বা নোটিশে প্রিন্ট করার উপযোগী।
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#C9A254]" />
                  <span>PNG ডাউনলোড করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#064E3B]/25 text-[#064E3B] text-sm font-semibold hover:bg-[#064E3B]/5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegenCounter((c) => c + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#064E3B]/15 text-[#40544A] text-sm font-medium hover:text-[#064E3B] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>রি-জেনারেট</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-[#52655B]">
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              QR কোড তৈরি করতে উপরে বৈধ প্রকাশিত ওয়েবসাইটের URL লিখুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
