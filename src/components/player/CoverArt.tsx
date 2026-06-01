import { useState, useEffect } from 'react';

interface CoverArtProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * CoverArt - 封面图片组件
 *
 * 匹配设计原型：
 * - 默认显示渐变封面（与设计中的 gradient 一致）
 * - 图片加载失败时显示默认封面 SVG
 */
export function CoverArt({ src, alt, className = '' }: CoverArtProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#FA2D48] via-[#FF6B6B] to-[#4ECDC4] flex items-center justify-center ${className}`}
      >
        <svg
          className="w-16 h-16 text-white/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
