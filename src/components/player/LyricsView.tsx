import { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { LyricsLine } from './LyricsLine';

/**
 * LyricsView - 歌词滚动视图
 *
 * 匹配设计原型：
 * - 隐藏滚动条
 * - 自动滚动到当前行（smooth + center）
 * - 点击歌词行跳转到对应时间
 */
export function LyricsView() {
  const lyrics = usePlayerStore((state) => state.currentSong?.lyrics);
  const lyricsState = usePlayerStore((state) => state.lyricsState);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到当前行
  useEffect(() => {
    if (!lyricsState || lyricsState.currentLineIndex < 0 || !containerRef.current) return;

    const children = containerRef.current.children;
    const currentLine = children[lyricsState.currentLineIndex] as HTMLElement;

    if (currentLine) {
      currentLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [lyricsState?.currentLineIndex]);

  if (!lyrics) {
    return (
      <div className="flex items-center justify-center h-full text-[#8E8E93] text-lg">
        暂无歌词
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="lyrics-container overflow-y-auto h-full px-8 py-12"
    >
      {/* 顶部留白，让第一行歌词可以滚动到中间 */}
      <div className="h-32" />
      {lyrics.lines.map((line, index) => (
        <LyricsLine
          key={index}
          line={line}
          isActive={index === lyricsState?.currentLineIndex}
          isPast={index < (lyricsState?.currentLineIndex ?? -1)}
          tokenProgress={
            index === lyricsState?.currentLineIndex
              ? lyricsState?.tokenProgress ?? 0
              : 0
          }
          onClick={() => seekTo(line.startTime)}
        />
      ))}
      {/* 底部留白 */}
      <div className="h-32" />
    </div>
  );
}
