import {
  ExternalLink,
  Facebook,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { UI_LABELS } from '../data/defaultSiteData';
import { normalizeExternalUrl } from '../lib/videoEmbed';
import { ContactInfo, Language } from '../types/site';

interface ContactSectionProps {
  lang: Language;
  title: string;
  subtitle: string;
  contact: ContactInfo;
}

function buildWhatsAppHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function buildPhoneHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return `tel:${trimmed.replace(/\s+/g, '')}`;
}

export function ContactSection({
  lang,
  title,
  subtitle,
  contact,
}: ContactSectionProps) {
  const labels = UI_LABELS[lang];

  const channels = [
    {
      id: 'whatsapp',
      label: labels.whatsappLabel,
      value: contact.whatsapp,
      href: buildWhatsAppHref(contact.whatsapp),
      actionLabel: labels.openLink,
      icon: MessageCircle,
      external: true,
    },
    {
      id: 'facebook',
      label: labels.facebookPageLabel,
      value: contact.facebookPageUrl,
      href: contact.facebookPageUrl ? normalizeExternalUrl(contact.facebookPageUrl) : '',
      actionLabel: labels.openLink,
      icon: Facebook,
      external: true,
    },
    {
      id: 'messenger',
      label: labels.messengerLabel,
      value: contact.messengerUrl,
      href: contact.messengerUrl ? normalizeExternalUrl(contact.messengerUrl) : '',
      actionLabel: labels.openLink,
      icon: Send,
      external: true,
    },
    {
      id: 'youtube',
      label: labels.youtubeChannelLabel,
      value: contact.youtubeChannelUrl,
      href: contact.youtubeChannelUrl ? normalizeExternalUrl(contact.youtubeChannelUrl) : '',
      actionLabel: labels.openLink,
      icon: Youtube,
      external: true,
    },
    {
      id: 'imo',
      label: labels.imoLabel,
      value: contact.imo,
      href: contact.imo ? buildPhoneHref(contact.imo) : '',
      actionLabel: labels.callNow,
      icon: MessageCircle,
      external: false,
    },
    {
      id: 'email',
      label: labels.emailLabel,
      value: contact.email,
      href: contact.email ? `mailto:${contact.email.trim()}` : '',
      actionLabel: labels.sendEmail,
      icon: Mail,
      external: false,
    },
    {
      id: 'phone',
      label: labels.phoneCallLabel,
      value: contact.phone,
      href: buildPhoneHref(contact.phone),
      actionLabel: labels.callNow,
      icon: Phone,
      external: false,
    },
    {
      id: 'maps',
      label: labels.googleMapsLabel,
      value: contact.addressLabel || contact.googleMapsUrl,
      href: contact.googleMapsUrl ? normalizeExternalUrl(contact.googleMapsUrl) : '',
      actionLabel: labels.openLink,
      icon: MapPin,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 border-t border-[#064E3B]/10 islamic-lattice-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight text-balance">
            {title}
          </h2>
          <p className="mt-3 text-base text-[#40544A] leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isConfigured = Boolean(ch.href);

            if (isConfigured) {
              return (
                <a
                  key={ch.id}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  className="group rounded-xl border border-[#064E3B]/15 bg-white p-5 flex flex-col justify-between gap-4 hover:border-[#064E3B] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="w-10 h-10 rounded-lg bg-[#064E3B]/8 text-[#064E3B] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#64746B] group-hover:text-[#064E3B] transition-colors shrink-0" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#17251E]">
                      {ch.label}
                    </h3>
                    <p className="mt-1 text-xs text-[#40544A] break-all line-clamp-1" dir="ltr">
                      {ch.value}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-[#064E3B] group-hover:text-[#B48A3E] transition-colors">
                    {ch.actionLabel}
                  </span>
                </a>
              );
            }

            return (
              <div
                key={ch.id}
                className="rounded-xl border border-[#064E3B]/10 bg-white/75 p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#EFECE3] text-[#64746B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#17251E]">
                    {ch.label}
                  </h3>
                  <p className="mt-1 text-xs text-[#64746B]">
                    {labels.notConfiguredYet}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
