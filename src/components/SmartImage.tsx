import { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SmartImage({ src, alt, className = '', fallbackTitle }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#064E3B] via-[#0B3B2E] to-[#122D25] text-[#FAF8F3] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-10 h-10 text-[#C9A254] mb-2 opacity-90"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M24 4L29.5 18.5L44 24L29.5 29.5L24 44L18.5 29.5L4 24L18.5 18.5L24 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="13"
            width="22"
            height="22"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        {fallbackTitle ? (
          <span className="text-xs font-medium tracking-wide text-[#FAF8F3]/85 line-clamp-2">
            {fallbackTitle}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
