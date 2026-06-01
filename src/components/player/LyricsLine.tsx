import { useMemo } from 'react';
import type { LyricsLine as LyricsLineType } from '../../types';

interface LyricsLineProps {
  line: LyricsLineType;
  isActive: boolean;
  isPast: boolean;
  tokenProgress: number;
  onClick: () => void;
}

/**
 * LyricsLine - 单行歌词组件
 *
 * 匹配设计原型：
 * - 默认状态：20px, rgba(255,255,255,0.3)
 * - 已播放状态：rgba(255,255,255,0.5)
 * - 当前播放状态：26px, 粗体, 纯白, scale(1.02)
 * - 逐字高亮使用 CSS background-clip:text 渐变
 */
export function LyricsLine({
  line,
  isActive,
  isPast,
  tokenProgress,
  onClick,
}: LyricsLineProps) {
  // 计算每个 token 的高亮状态
  const tokensWithProgress = useMemo(() => {
    if (!isActive) {
      return line.tokens.map((token) => ({
        ...token,
        progress: isPast ? 1 : 0,
      }));
    }

    // 计算当前行内每个字的进度
    return line.tokens.map((token) => {
      const lineDuration = line.endTime - line.startTime;
      if (lineDuration <= 0) return { ...token, progress: 0 };

      const tokenStartProgress = (token.start - line.startTime) / lineDuration;
      const tokenEndProgress = (token.end - line.startTime) / lineDuration;

      let progress = 0;
      if (tokenProgress >= tokenEndProgress) {
        progress = 1;
      } else if (tokenProgress > tokenStartProgress) {
        progress =
          (tokenProgress - tokenStartProgress) /
          (tokenEndProgress - tokenStartProgress);
      }

      return { ...token, progress };
    });
  }, [line, isActive, isPast, tokenProgress]);

  return (
    <div
      className={`lyrics-line ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
      onClick={onClick}
    >
      {isActive
        ? tokensWithProgress.map((token, index) => (
            <span
              key={index}
              className="lyrics-token"
              style={
                {
                  '--progress': `${token.progress * 100}%`,
                } as React.CSSProperties
              }
            >
              {token.text}
            </span>
          ))
        : line.text}
    </div>
  );
}
